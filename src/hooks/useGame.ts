
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ResourceId, CardData, Choice, StoryFlag } from '@/lib/game-data';
import {
  gameCards,
  INITIAL_RESOURCE_VALUE,
  gameOverConditions,
} from '@/lib/game-data';
import { allAchievements, type AchievementId } from '@/lib/achievements-data';
import type { User } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { doc, getDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export type Resources = Record<ResourceId, number>;
export type GameState = 'title' | 'playing' | 'gameover' | 'creator_intervention';
export type StoryFlags = Set<StoryFlag>;

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
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
const storyFlagsFromJSON = (flags: StoryFlag[] | undefined) => new Set(flags || []);

export const useGame = (user: User | null) => {
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
  const [isGameLoading, setGameLoading] = useState(true);
  const [hasSave, setHasSave] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  
  const [cardsPerYear, setCardsPerYear] = useState(getRandomInt(2, 5));
  const [cardInYearCount, setCardInYearCount] = useState(0);

  const firestore = useFirestore();

  const debouncedSave = useMemo(() => debounce((saveState: any) => {
    if (user && firestore && gameState === "playing" && !user.isAnonymous) {
        const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
        setDocumentNonBlocking(checkpointRef, saveState, { merge: true });
    }
  }, 1500), [user, firestore, gameState]);

  const awardAchievements = useCallback(async (achievementIds: AchievementId[]) => {
      if (!user || user.isAnonymous || !firestore || achievementIds.length === 0) return;
      
      const batch = writeBatch(firestore);
      const achievementsCollectionRef = collection(firestore, 'users', user.uid, 'achievements');
      
      achievementIds.forEach(id => {
          const achievementRef = doc(achievementsCollectionRef, id);
          batch.set(achievementRef, {
              achievementId: id,
              userId: user.uid,
              timestamp: serverTimestamp(),
          });
      });
      
      await batch.commit().catch(err => console.error("Failed to award achievements", err));

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
            // This is a non-blocking update
            setDocumentNonBlocking(leaderboardEntryRef, scoreData, { merge: true });
        }
    } catch (error) {
        // This is a non-critical error, so we just log it.
        console.error("An error occurred while trying to record score:", error);
    }
  }, [user, firestore]);


  const startGame = useCallback((useFlags?: StoryFlags) => {
    setResources({
      environment: INITIAL_RESOURCE_VALUE,
      people: INITIAL_RESOURCE_VALUE,
      army: INITIAL_RESOURCE_VALUE,
      money: INITIAL_RESOURCE_VALUE,
    });
    
    const tutorialCards = gameCards.filter(c => c.id >= 0 && c.id <= 2).sort((a,b) => a.id - b.id);
    const regularCards = gameCards.filter(c => c.id > 2 && !c.isSpecial);
    const shuffledMainDeck = shuffleArray(regularCards);
    
    const flags = useFlags || new Set();
    
    const includeTutorial = !tutorialCompleted && !flags.has('creator_github_mercy');
    
    let initialDeck: CardData[] = [];

    if (includeTutorial) {
      initialDeck = [...tutorialCards, ...shuffledMainDeck];
    } else {
      initialDeck = shuffledMainDeck;
    }
    
    setDeck(initialDeck);
    setCurrentCardIndex(0);
    setGameState("playing");
    setGameOverMessage("");
    setLastEffects({});
    setYear(0);
    setCardInYearCount(0);
    setCardsPerYear(getRandomInt(2,5));
    setStoryFlags(flags);
    setPrescienceCharges(flags.has('creator_linkedin_prescience') ? 10 : 0);
  }, [tutorialCompleted]);

  const deleteSave = useCallback(async () => {
    if (user && firestore && !user.isAnonymous) {
      const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
      try {
        await deleteDoc(checkpointRef);
        setHasSave(false);
      } catch (err) {
        console.error("Failed to delete checkpoint:", err);
      }
    } else {
        setHasSave(false);
    }
  }, [user, firestore]);

  const loadGame = useCallback(async () => {
    if (!user || !firestore || user.isAnonymous) {
        setGameState('title');
        return;
    };
    setGameLoading(true);
    const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
    try {
      const docSnap = await getDoc(checkpointRef);
      if (docSnap.exists()) {
        const savedState = docSnap.data();
        
        if (!savedState.deckIds) {
            console.warn("Old save format detected. Deleting and starting new game.");
            await deleteSave();
            startGame();
            return;
        }
        
        const loadedDeck = savedState.deckIds.map((id: number) => gameCards.find(c => c.id === id)).filter(Boolean) as CardData[];
        
        setResources(savedState.resources);
        setDeck(loadedDeck);
        setCurrentCardIndex(savedState.currentCardIndex);
        setYear(savedState.year);
        setCardInYearCount(savedState.cardInYearCount || 0);
        setCardsPerYear(savedState.cardsPerYear || getRandomInt(2, 5));
        setStoryFlags(storyFlagsFromJSON(savedState.storyFlags));
        setPrescienceCharges(savedState.prescienceCharges || 0);
        setTutorialCompleted(savedState.tutorialCompleted || false);
        setGameState("playing");
        setHasSave(true);
        setLastEffects({});
        setGameOverMessage("");
      } else {
        setHasSave(false);
        startGame();
      }
    } catch (error) {
        console.error("Error loading game:", error);
        startGame();
    } finally {
        setGameLoading(false);
    }
  }, [user, firestore, startGame, deleteSave]);

  useEffect(() => {
    const checkSave = async () => {
      if (!user || user.isAnonymous || !firestore) {
        setGameLoading(false);
        setGameState('title');
        setHasSave(false);
        return;
      }
      setGameLoading(true);
      const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
      try {
        const docSnap = await getDoc(checkpointRef);
        const saveExists = docSnap.exists();
        setHasSave(saveExists);
        setTutorialCompleted(saveExists ? docSnap.data().tutorialCompleted || false : false);
      } catch (error) {
        console.error("Error checking for save game:", error);
        setHasSave(false);
      } finally {
        setGameLoading(false);
        if (gameState !== 'playing') {
            setGameState('title');
        }
      }
    };
    checkSave();
  }, [user, firestore]);

  useEffect(() => {
    if (gameState !== 'playing' || !user || user.isAnonymous) return;
    const saveState = {
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
      updatedAt: new Date().toISOString(),
    };
    debouncedSave(saveState);
  }, [resources, deck, currentCardIndex, year, cardInYearCount, cardsPerYear, storyFlags, prescienceCharges, tutorialCompleted, user, debouncedSave, gameState]);


  const getNextCard = useCallback(() => {
    let nextIndex = currentCardIndex + 1;
    let newDeck = [...deck];

    const findNextValidCardIndex = (startIndex: number, currentDeck: CardData[]) => {
        let i = startIndex;
        while (i < currentDeck.length) {
            const card = currentDeck[i];
            if (!card) return -1;
            const isBlocked = card.blockedByFlags?.some(flag => storyFlags.has(flag));
            if (!isBlocked) {
                return i;
            }
            i++;
        }
        return -1;
    };
    
    const isInjectable = (card: CardData) => 
        !deck.some(dCard => dCard.id === card.id) &&
        card.requiredFlags?.every(flag => storyFlags.has(flag)) &&
        !card.blockedByFlags?.some(flag => storyFlags.has(flag));
        
    const storyCardsToInject = gameCards.filter(isInjectable);

    if (storyCardsToInject.length > 0) {
        newDeck.splice(nextIndex, 0, ...storyCardsToInject);
        setDeck(newDeck);
        const nextValid = findNextValidCardIndex(nextIndex, newDeck);
        if (nextValid !== -1) return nextValid;
    }

    let validNextIndex = findNextValidCardIndex(nextIndex, newDeck);
    
    if (validNextIndex === -1) {
        const seenStandardCardIds = new Set(deck.slice(0, nextIndex).map(c => c.id));
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

    return validNextIndex;
  }, [currentCardIndex, deck, storyFlags]);

  const handleCreatorIntervention = useCallback((choice: Choice) => {
    if (choice.action) choice.action();
    
    if (choice.setFlag === 'creator_github_mercy') {
      const newFlags = new Set(storyFlags);
      newFlags.add('creator_github_mercy');
      setStoryFlags(newFlags);
      setGameState("playing");
    } else {
      recordScore(year);
      deleteSave();
      setGameState("gameover");
    }
  }, [storyFlags, year, recordScore, deleteSave]);


  const handleChoice = useCallback((choice: Choice) => {
    const currentCard = deck[currentCardIndex];
    if (gameState !== 'playing' || !currentCard) return;

    if (choice.action) choice.action();

    setLastEffects(choice.effects);

    const newStoryFlags = new Set(storyFlags);
    if (choice.setFlag) {
      newStoryFlags.add(choice.setFlag);
    }
    
    let newResources = { ...resources };
    let gameOverTrigger = false;
    let message = "";
    let endFlag: AchievementId | null = null;
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
            setCardsPerYear(getRandomInt(2, 5));
        }
    }

    setCardInYearCount(nextCardInYearCount);

    
    if (prescienceCharges > 0) {
      setPrescienceCharges(c => c - 1);
    }

    if (choice.setFlag === 'creator_linkedin_prescience') {
      setPrescienceCharges(10);
      achievementsToAward.push('gift_of_foresight');
    }
    
    if (currentCard.id === 2) { 
      setTutorialCompleted(true);
    }
    
    if (currentCard?.id === 201 && choice.text.includes("Embrace")) {
        gameOverTrigger = true;
        message = gameOverConditions.studied_star_ending;
        endFlag = 'cosmic_merger';
    } else if (nextYear >= 50) {
        const isBalanced = Object.values(newResources).every(v => v > 30 && v < 70);
        if (isBalanced) {
            gameOverTrigger = true;
            message = gameOverConditions.golden_age;
            endFlag = 'golden_age';
        }
    }
    
    if (!gameOverTrigger) {
        for (const key in newResources) {
            const resourceId = key as ResourceId;
            if (newResources[resourceId] <= 0) {
                gameOverTrigger = true;
                message = gameOverConditions[`${resourceId}_low`];
                endFlag = `${resourceId}_low` as AchievementId;
                break;
            }
            if (newResources[resourceId] >= 100) {
                gameOverTrigger = true;
                message = gameOverConditions[`${resourceId}_high`];
                endFlag = `${resourceId}_high` as AchievementId;
                break;
            }
        }
    }

    // --- Story-based achievement checks ---
    if (newStoryFlags.has('plague_cured_by_sacrifice') || newStoryFlags.has('plague_cured_by_isolation')) {
      achievementsToAward.push('plague_survivor');
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
    if (newStoryFlags.has('plague_allowed_ship') && !newStoryFlags.has('plague_started') && Math.random() < plagueChance) {
        const plagueCard = gameCards.find(card => card.id === 104);
        if (plagueCard) {
            const newDeck = [...deck];
            newDeck.splice(currentCardIndex + 1, 0, plagueCard);
            setDeck(newDeck);
        }
    }

    if (gameOverTrigger) {
      setGameOverMessage(message);
      setYear(nextYear);

      if (endFlag) achievementsToAward.push(endFlag);
      if (nextYear >= 100) achievementsToAward.push('centenarian');
      else if (nextYear >= 50) achievementsToAward.push('half_centenarian');
      else if (nextYear >= 25) achievementsToAward.push('quarter_centenarian');

      awardAchievements(achievementsToAward);
      recordScore(nextYear);
      deleteSave();

      if (!storyFlags.has('creator_github_mercy')) {
        setGameState("creator_intervention");
      } else {
        setGameState("gameover");
      }

    } else {
       setStoryFlags(newStoryFlags);
       const nextCardIndex = getNextCard();
       if (nextCardIndex !== -1) {
         setCurrentCardIndex(nextCardIndex);
         setYear(nextYear);
       } else {
         setGameOverMessage("You have seen all that this timeline has to offer. The world fades to dust.");
         recordScore(nextYear);
         deleteSave();
         setGameState("gameover");
       }
    }
  }, [deck, currentCardIndex, gameState, storyFlags, resources, year, cardInYearCount, cardsPerYear, getNextCard, user, awardAchievements, deleteSave, recordScore, prescienceCharges]);

  const returnToTitle = async () => {
    await deleteSave();
    setGameState("title");
    setHasSave(false);
  }

  return {
    resources,
    deck,
    currentCardIndex,
    gameState,
    gameOverMessage,
    lastEffects,
    year,
    hasSave,
    storyFlags,
    prescienceCharges,
    isGameLoading,
    startGame,
    loadGame,
    handleChoice,
    handleCreatorIntervention,
    returnToTitle,
    deleteSave,
  };
};
