
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ResourceId, CardData, Choice, StoryFlag } from '@/lib/game-data';
import {
  gameCards,
  INITIAL_RESOURCE_VALUE,
  gameOverConditions,
  getCardText,
} from '@/lib/game-data';
import { allAchievements, type AchievementId } from '@/lib/achievements-data';
import type { User } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { doc, getDoc, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useCheckpoint, type Checkpoint } from './useCheckpoint';

export type Resources = Record<ResourceId, number>;
export type GameState = 'title' | 'playing' | 'gameover' | 'creator_intervention';
export type StoryFlags = Set<StoryFlag>;
export interface GameHistoryEvent {
  year: number;
  card: CardData;
  choice: Choice;
  text: string;
}

interface useGameProps {
  user: User | null;
  setHasSave: (hasSave: boolean) => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const storyFlagsToJSON = (flags: StoryFlags) => Array.from(flags);
export const storyFlagsFromJSON = (flags: StoryFlag[] | undefined) => new Set(flags || []);

export const useGame = ({ user, setHasSave }: useGameProps) => {
  const [resources, setResources] = useState<Resources>({
    environment: INITIAL_RESOURCE_VALUE,
    people: INITIAL_RESOURCE_VALUE,
    army: INITIAL_RESOURCE_VALUE,
    money: INITIAL_RESOURCE_VALUE,
  });
  const [deck, setDeck] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('title');
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [lastEffects, setLastEffects] = useState<Partial<Record<ResourceId, number>>>({});
  const [year, setYear] = useState(0);
  const [storyFlags, setStoryFlags] = useState<StoryFlags>(new Set());
  const [prescienceCharges, setPrescienceCharges] = useState(0);
  const [isGameLoading, setGameLoading] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [gameOverCause, setGameOverCause] = useState<ResourceId | 'star' | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryEvent[]>([]);
  
  const [cardsPerYear, setCardsPerYear] = useState(getRandomInt(2, 5));
  const [cardInYearCount, setCardInYearCount] = useState(0);

  const firestore = useFirestore();
  const { saveCheckpoint, deleteCheckpoint } = useCheckpoint(user);


  const awardAchievements = useCallback(async (achievementIds: AchievementId[]) => {
      if (!user || user.isAnonymous || !firestore || achievementIds.length === 0) return;
      
      const batch = writeBatch(firestore);
      const achievementsCollectionRef = collection(firestore, 'users', user.uid, 'achievements');
      
      const achievementData: Record<string, any> = {};
      achievementIds.forEach(id => {
          const achievementRef = doc(achievementsCollectionRef, id);
          const data = {
              achievementId: id,
              userId: user.uid,
              timestamp: serverTimestamp(),
          };
          batch.set(achievementRef, data);
          achievementData[id] = data;
      });
      
      try {
        await batch.commit();
      } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: achievementsCollectionRef.path,
            operation: 'write',
            requestResourceData: achievementData,
        });
        errorEmitter.emit('permission-error', permissionError);
      }

  }, [user, firestore]);

  const recordScore = useCallback(async (finalYear: number) => {
    if (!user || !firestore || user.isAnonymous) return;

    const leaderboardEntryRef = doc(firestore, 'leaderboards', 'dynasty', 'entries', user.uid);
    const profileRef = doc(firestore, 'users', user.uid);

    try {
        const [profileSnap, entrySnap] = await Promise.all([
            getDoc(profileRef),
            getDoc(leaderboardEntryRef)
        ]);

        const username = profileSnap.exists() ? (profileSnap.data().username || 'Anonymous Ruler') : 'Anonymous Ruler';
        const currentScore = entrySnap.exists() ? entrySnap.data().score : 0;
        
        if (finalYear > currentScore) {
            const scoreData = {
                userId: user.uid,
                username: username,
                score: finalYear,
                timestamp: serverTimestamp(),
            };
            setDocumentNonBlocking(leaderboardEntryRef, scoreData, { merge: true });
        }
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: `Checking ${profileRef.path} and ${leaderboardEntryRef.path}`,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  }, [user, firestore]);


  const startGame = useCallback((isTutorialCompleted: boolean, useFlags?: StoryFlags, startResources?: Resources) => {
    setGameLoading(true);
    setResources(startResources || {
      environment: INITIAL_RESOURCE_VALUE,
      people: INITIAL_RESOURCE_VALUE,
      army: INITIAL_RESOURCE_VALUE,
      money: INITIAL_RESOURCE_VALUE,
    });
    
    const tutorialCards = gameCards.filter(c => c.id >= 0 && c.id <= 2).sort((a,b) => a.id - b.id);
    const regularCards = gameCards.filter(c => c.id > 2 && !c.isSpecial);
    const shuffledMainDeck = shuffleArray(regularCards);
    
    const flags = useFlags || new Set();
    
    const includeTutorial = !isTutorialCompleted && !flags.has('creator_github_mercy');
    
    let initialDeck: CardData[] = [];

    if (includeTutorial) {
      initialDeck = [...tutorialCards, ...shuffledMainDeck];
    } else {
        if (flags.has('creator_github_mercy') && !flags.has('creator_mercy_acknowledged')) {
            const mercyCard = gameCards.find(c => c.id === 304);
            if(mercyCard) {
                initialDeck = [mercyCard, ...shuffledMainDeck];
            } else {
                initialDeck = shuffledMainDeck;
            }
        } else {
             initialDeck = shuffledMainDeck;
        }
    }
    
    setDeck(initialDeck);
    setCurrentCardIndex(0);
    setGameState("playing");
    setGameOverMessage("");
    setGameOverCause(null);
    setLastEffects({});
    setYear(0);
    setCardInYearCount(0);
    setCardsPerYear(getRandomInt(2,5));
    setStoryFlags(flags);
    setPrescienceCharges(flags.has('creator_linkedin_prescience') ? 10 : 0);
    setTutorialCompleted(isTutorialCompleted);
    setGameHistory([]);
    setGameLoading(false);
  }, []);

  const loadGame = useCallback((checkpoint: Checkpoint) => {
    setGameLoading(true);
    const loadedDeck = checkpoint.deckIds.map((id: number) => gameCards.find(c => c.id === id)).filter(Boolean) as CardData[];
    
    setResources(checkpoint.resources);
    setDeck(loadedDeck);
    setCurrentCardIndex(checkpoint.currentCardIndex);
    setYear(checkpoint.year);
    setCardInYearCount(checkpoint.cardInYearCount || 0);
    setCardsPerYear(checkpoint.cardsPerYear || getRandomInt(2, 5));
    setStoryFlags(storyFlagsFromJSON(checkpoint.storyFlags));
    setPrescienceCharges(checkpoint.prescienceCharges || 0);
    setTutorialCompleted(checkpoint.tutorialCompleted || false);
    setGameHistory(checkpoint.gameHistory || []);
    setGameState("playing");
    setLastEffects({});
    setGameOverMessage("");
    setGameOverCause(null);
    setGameLoading(false);
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || !user || user.isAnonymous) return;
    const saveState: Checkpoint = {
      userId: user.uid,
      resources,
      deckIds: deck.map(card => card.id),
      currentCardIndex,
      year,
      cardInYearCount,
      cardsPerYear,
      storyFlags: storyFlagsToJSON(storyFlags),
      prescienceCharges,
      tutorialCompleted,
      gameHistory,
      updatedAt: new Date().toISOString(),
    };
    saveCheckpoint(saveState);
  }, [resources, deck, currentCardIndex, year, cardInYearCount, cardsPerYear, storyFlags, prescienceCharges, tutorialCompleted, gameHistory, user, saveCheckpoint, gameState]);


  const getNextCard = useCallback(() => {
    let nextIndex = currentCardIndex + 1;
    let newDeck = [...deck];

    const findNextValidCardIndex = (startIndex: number, currentDeck: CardData[]) => {
        for (let i = startIndex; i < currentDeck.length; i++) {
            const card = currentDeck[i];
            if (card && !card.blockedByFlags?.some(flag => storyFlags.has(flag))) {
                return i;
            }
        }
        return -1;
    };
    
    const storyCardsToInject = gameCards.filter(card => 
        !deck.some(dCard => dCard.id === card.id) &&
        card.requiredFlags?.every(flag => storyFlags.has(flag)) &&
        !card.blockedByFlags?.some(flag => storyFlags.has(flag))
    );

    if (storyCardsToInject.length > 0) {
        newDeck.splice(nextIndex, 0, ...storyCardsToInject);
        setDeck(newDeck);
        const nextValid = findNextValidCardIndex(nextIndex, newDeck);
        if (nextValid !== -1) return nextValid;
    }

    let validNextIndex = findNextValidCardIndex(nextIndex, newDeck);
    
    if (validNextIndex === -1) {
        const seenStandardCardIds = new Set(newDeck.slice(0, nextIndex).map(c => c.id));
        const reshuffleableCards = gameCards.filter(c => 
            !c.isSpecial && 
            !c.requiredFlags && 
            seenStandardCardIds.has(c.id) &&
            !(c.id >= 0 && c.id <= 2)
        );

        const newShuffledCards = shuffleArray(reshuffleableCards);
        
        const reshuffledDeck = [...newDeck, ...newShuffledCards];
        setDeck(reshuffledDeck);
        
        validNextIndex = findNextValidCardIndex(nextIndex, reshuffledDeck);
    }

    return validNextIndex !== -1 ? validNextIndex : -1;
  }, [currentCardIndex, deck, storyFlags]);

  const handleCreatorIntervention = useCallback((choice: Choice) => {
    if (gameState !== 'creator_intervention') return;

    if (choice.action) choice.action();
    
    if (choice.setFlag === 'creator_github_mercy') {
      const newFlags = new Set(storyFlags);
      newFlags.add('creator_github_mercy');
      setStoryFlags(newFlags);

      const weakenedResources: Resources = {
        environment: getRandomInt(25, 45),
        people: getRandomInt(25, 45),
        army: getRandomInt(25, 45),
        money: getRandomInt(25, 45),
      };
      setResources(weakenedResources);
      
      const regularCards = gameCards.filter(c => c.id > 2 && !c.isSpecial);
      const shuffledMainDeck = shuffleArray(regularCards);
      const mercyCard = gameCards.find(c => c.id === 304);
      let newDeck = mercyCard ? [mercyCard, ...shuffledMainDeck] : shuffledMainDeck;

      setDeck(newDeck);
      setCurrentCardIndex(0);
      setGameState("playing");
      setLastEffects({});
      setGameOverCause(null);
      awardAchievements(['creator_mercy']);
      setGameHistory([]);

    } else {
      recordScore(year);
      deleteCheckpoint();
      setGameState("gameover");
    }
  }, [gameState, storyFlags, year, recordScore, deleteCheckpoint, awardAchievements]);


  const handleChoice = useCallback((choice: Choice) => {
    if (gameState !== 'playing') return;

    const currentCard = deck[currentCardIndex];
    if (!currentCard) return;

    if (choice.action) choice.action();

    setLastEffects(choice.effects);
    
    const cardText = getCardText(currentCard, resources);
    setGameHistory(prev => [...prev, { year, card: currentCard, choice, text: cardText }]);

    const newStoryFlags = new Set(storyFlags);
    if (choice.setFlag) {
      newStoryFlags.add(choice.setFlag);
    }
    
    let newResources = { ...resources };
    let gameOverTrigger = false;
    let message = "";
    let endFlag: AchievementId | null = null;
    let cause: ResourceId | 'star' | null = null;
    let achievementsToAward: AchievementId[] = [];

    for (const [resource, effect] of Object.entries(choice.effects)) {
      newResources[resource as ResourceId] = Math.max(0, Math.min(100, newResources[resource as ResourceId] + effect));
    }
    
    setResources(newResources);

    let nextYear = year;
    let nextCardInYearCount = cardInYearCount + 1;
    
    if (![0,1,2,304].includes(currentCard.id)) {
        if(nextCardInYearCount >= cardsPerYear) {
            nextYear = year + 1;
            nextCardInYearCount = 0;
            setCardsPerYear(getRandomInt(2,5));
        }
    }
    
    if (prescienceCharges > 0) {
      setPrescienceCharges(c => c - 1);
    }

    if (choice.setFlag === 'creator_linkedin_prescience' && !storyFlags.has('creator_linkedin_prescience')) {
      setPrescienceCharges(10);
      achievementsToAward.push('gift_of_foresight');
    }
    
    if (currentCard.id === 2 && !tutorialCompleted) { 
      setTutorialCompleted(true);
    }
    
    if (currentCard?.id === 201 && choice.text.includes("Embrace")) {
        gameOverTrigger = true;
        message = gameOverConditions.studied_star_ending;
        endFlag = 'cosmic_merger';
        cause = 'star';
    } else if (nextYear >= 50) {
        const isBalanced = Object.values(newResources).every(v => v > 30 && v < 70);
        if (isBalanced) {
            gameOverTrigger = true;
            message = gameOverConditions.golden_age;
            endFlag = 'golden_age';
            cause = 'star';
        }
    }
    
    if (!gameOverTrigger) {
        for (const key in newResources) {
            const resourceId = key as ResourceId;
            if (newResources[resourceId] <= 0) {
                gameOverTrigger = true;
                message = gameOverConditions[`${resourceId}_low`];
                endFlag = `${resourceId}_low` as AchievementId;
                cause = resourceId;
                break;
            }
            if (newResources[resourceId] >= 100) {
                gameOverTrigger = true;
                message = gameOverConditions[`${resourceId}_high`];
                endFlag = `${resourceId}_high` as AchievementId;
                cause = resourceId;
                break;
            }
        }
    }

    if (newStoryFlags.has('plague_cured_by_sacrifice') || newStoryFlags.has('plague_cured_by_isolation')) {
      if (!storyFlags.has('plague_cured_by_sacrifice') && !storyFlags.has('plague_cured_by_isolation')) {
        achievementsToAward.push('plague_survivor');
      }
    }
    
    const isAnyResourceLow = Object.values(newResources).some(v => v > 0 && v < 15);
    if (!gameOverTrigger && isAnyResourceLow && Math.random() < 0.25 && !deck.some(c => c.id === 50)) {
        const mercyCard = gameCards.find(c => c.id === 50);
        if (mercyCard) {
            const newDeck = [...deck];
            newDeck.splice(currentCardIndex + 1, 0, mercyCard);
            setDeck(newDeck);
        }
    }
    
    const plagueChance = user?.isAnonymous ? 0.8 : 0.2;
    if (newStoryFlags.has('plague_allowed_ship') && !storyFlags.has('plague_started') && Math.random() < plagueChance) {
        const plagueCard = gameCards.find(card => card.id === 104);
        if (plagueCard) {
            const newDeck = [...deck];
            newDeck.splice(currentCardIndex + 1, 0, plagueCard);
            setDeck(newDeck);
        }
    }

    if (gameOverTrigger) {
      if (endFlag) achievementsToAward.push(endFlag);
      if (nextYear >= 100) achievementsToAward.push('centenarian');
      else if (nextYear >= 50) achievementsToAward.push('half_centenarian');
      else if (nextYear >= 25) achievementsToAward.push('quarter_centenarian');

      awardAchievements(achievementsToAward);
      recordScore(nextYear);
      
      const wasMercyUsed = storyFlags.has('creator_github_mercy');
      
      setGameOverMessage(message);
      setGameOverCause(cause);
      setYear(nextYear);
      setCardInYearCount(nextCardInYearCount);
      deleteCheckpoint();

      if (!wasMercyUsed) {
        setGameState("creator_intervention");
      } else {
        setGameState("gameover");
      }
      return;
    } 
    
    setStoryFlags(newStoryFlags);
    setYear(nextYear);
    setCardInYearCount(nextCardInYearCount);

    const nextCardIndex = getNextCard();
    if (nextCardIndex !== -1) {
      setCurrentCardIndex(nextCardIndex);
    } else {
      setGameOverMessage("You have seen all that this timeline has to offer. The world fades to dust.");
      setGameOverCause('star');
      recordScore(nextYear);
      deleteCheckpoint();
      setGameState("gameover");
    }
    
  }, [deck, currentCardIndex, gameState, storyFlags, resources, year, cardInYearCount, cardsPerYear, getNextCard, user, awardAchievements, deleteCheckpoint, recordScore, prescienceCharges, tutorialCompleted]);

  const returnToTitle = useCallback(() => {
    setGameState("title");
    setHasSave(false); // Assume save is gone after game over
  },[setHasSave]);

  return {
    resources,
    deck,
    currentCardIndex,
    gameState,
    gameOverMessage,
    gameOverCause,
    gameHistory,
    lastEffects,
    year,
    storyFlags,
    prescienceCharges,
    isGameLoading,
    startGame,
    loadGame,
    handleChoice,
    handleCreatorIntervention,
    returnToTitle,
    tutorialCompleted,
  };
};
