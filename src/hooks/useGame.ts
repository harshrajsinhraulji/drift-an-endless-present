
'use client';
import { useState, useEffect, useCallback } from 'react';
import type { ResourceId, CardData, Choice, StoryFlag } from '@/lib/game-data';
import {
  gameCards,
  INITIAL_RESOURCE_VALUE,
  gameOverConditions,
} from '@/lib/game-data';
import type { User } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export type Resources = Record<ResourceId, number>;
export type GameState = 'title' | 'playing' | 'gameover' | 'creator_intervention';
export type StoryFlags = Set<StoryFlag>;

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper function to convert Set to Array for JSON serialization
const storyFlagsToJSON = (flags: StoryFlags) => Array.from(flags);
// Helper function to convert Array back to Set after JSON parsing
const storyFlagsFromJSON = (flags: StoryFlag[]) => new Set(flags);

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
  const firestore = useFirestore();

  const startNewGame = useCallback((flags: StoryFlags = new Set()) => {
    setResources({
      environment: INITIAL_RESOURCE_VALUE,
      people: INITIAL_RESOURCE_VALUE,
      army: INITIAL_RESOURCE_VALUE,
      money: INITIAL_RESOURCE_VALUE,
    });
    
    const tutorialCard = gameCards.find(c => c.id === 0);
    const regularCards = gameCards.filter(c => c.id !== 0 && !c.isSpecial);
    const shuffledMainDeck = shuffleArray(regularCards);
    
    const includeTutorial = !flags.has('creator_github_mercy');
    let initialDeck: CardData[] = [];
    if (includeTutorial && tutorialCard) {
      initialDeck = [tutorialCard, ...shuffledMainDeck];
    } else {
      initialDeck = shuffledMainDeck;
    }
    
    setDeck(initialDeck);
    setCurrentCardIndex(0);
    setGameState("playing");
    setGameOverMessage("");
    setLastEffects({});
    setYear(1);
    setStoryFlags(flags);
    setPrescienceCharges(flags.has('creator_linkedin_prescience') ? 10 : 0);
  }, []);

  const loadGame = useCallback(async () => {
    if (!user || !firestore) return;
    setGameLoading(true);
    const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
    try {
      const docSnap = await getDoc(checkpointRef);
      if (docSnap.exists()) {
        const savedState = docSnap.data();
        setResources(savedState.resources);
        setDeck(savedState.deck);
        setCurrentCardIndex(savedState.currentCardIndex);
        setYear(savedState.year);
        setStoryFlags(storyFlagsFromJSON(savedState.storyFlags || []));
        setPrescienceCharges(savedState.prescienceCharges || 0);
        setGameState("playing");
        setLastEffects({});
        setGameOverMessage("");
      } else {
        startNewGame();
      }
    } catch (error) {
        console.error("Error loading game:", error);
        startNewGame(); // Start new game on error
    } finally {
        setGameLoading(false);
    }
  }, [user, firestore, startNewGame]);

  useEffect(() => {
    const checkSave = async () => {
      if (!user || !firestore) {
        setGameLoading(false);
        setGameState('title');
        return;
      }
      setGameLoading(true);
      const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
      try {
        const docSnap = await getDoc(checkpointRef);
        setHasSave(docSnap.exists());
      } catch (error) {
        console.error("Error checking for save game:", error);
        setHasSave(false);
      } finally {
        setGameLoading(false);
        // After checking for a save, go to title screen.
        // The user will then choose to "Continue" or "Start New".
        setGameState('title');
      }
    };

    if (user) {
      checkSave();
    } else {
      setGameState('title');
      setGameLoading(false);
    }
  }, [user, firestore]);

  useEffect(() => {
    if (user && firestore && gameState === "playing") {
      const saveState = {
        userId: user.uid,
        resources,
        deck,
        currentCardIndex,
        year,
        storyFlags: storyFlagsToJSON(storyFlags),
        prescienceCharges,
        updatedAt: new Date().toISOString(),
      };
      const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
      setDocumentNonBlocking(checkpointRef, saveState, { merge: true });
    }
  }, [user, firestore, gameState, resources, deck, currentCardIndex, year, storyFlags, prescienceCharges]);


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
            c.id !== 0
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
      
      startNewGame(newFlags);
      const thankYouCard = gameCards.find(c => c.id === 304);
      if (thankYouCard) {
        setDeck(currentDeck => [thankYouCard, ...currentDeck]);
        setCurrentCardIndex(0);
      }

    } else {
      setGameState("gameover");
    }
  }, [storyFlags, startNewGame]);


  const handleChoice = useCallback((choice: Choice) => {
    const currentCard = deck[currentCardIndex];
    if (gameState !== 'playing' || !currentCard) return;

    if (choice.action) choice.action();

    setLastEffects(choice.effects);

    const newStoryFlags = new Set(storyFlags);
    if (choice.setFlag) {
      newStoryFlags.add(choice.setFlag);
      setStoryFlags(newStoryFlags);
      if (choice.setFlag === 'creator_linkedin_prescience') {
        setPrescienceCharges(10);
      }
    }
    
    let newResources = { ...resources };
    let gameOverTrigger = false;
    let message = "";

    for (const [resource, effect] of Object.entries(choice.effects)) {
      newResources[resource as ResourceId] = Math.max(0, Math.min(100, newResources[resource as ResourceId] + effect));
    }
    
    setResources(newResources);
    
    if (currentCard.id !== 0 && currentCard.id !== 304) {
      setYear(y => y + 1);
    }

    if (currentCard?.id === 201 && choice.text.includes("Embrace")) {
        gameOverTrigger = true;
        message = gameOverConditions.studied_star_ending;
    } else if (year + 1 >= 50) {
        const isBalanced = Object.values(newResources).every(v => v > 30 && v < 70);
        if (isBalanced) {
            gameOverTrigger = true;
            message = gameOverConditions.golden_age;
        }
    }
    
    if (!gameOverTrigger) {
        for (const key in newResources) {
            const resourceId = key as ResourceId;
            if (newResources[resourceId] <= 0) {
                gameOverTrigger = true;
                message = gameOverConditions[`${resourceId}_low`];
                break;
            }
            if (newResources[resourceId] >= 100) {
                gameOverTrigger = true;
                message = gameOverConditions[`${resourceId}_high`];
                break;
            }
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


    if (year > 10 && !storyFlags.has('creator_linkedin_prescience') && !deck.some(c => c.id === 303) && Math.random() < 0.2) {
      const creatorCard = gameCards.find(c => c.id === 303);
      if(creatorCard) {
        const newDeck = [...deck];
        newDeck.splice(currentCardIndex + 1, 0, creatorCard);
        setDeck(newDeck);
        setCurrentCardIndex(currentCardIndex + 1);
        return;
      }
    }

    if (gameOverTrigger) {
      setGameOverMessage(message);
      if (user && firestore) {
        const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
        setDocumentNonBlocking(checkpointRef, { deletedAt: new Date().toISOString() }, { merge: true });
      }

      if (!storyFlags.has('creator_github_mercy')) {
        setGameState("creator_intervention");
      } else {
        setGameState("gameover");
      }

    } else {
       const nextCardIndex = getNextCard();
       if (nextCardIndex !== -1) {
         setCurrentCardIndex(nextCardIndex);
       } else {
         setGameOverMessage("You have seen all that this timeline has to offer. The world fades to dust.");
         setGameState("gameover");
       }
    }
  }, [deck, currentCardIndex, gameState, storyFlags, resources, year, getNextCard, user, firestore]);

  const returnToTitle = () => {
    setGameState("title");
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
    startNewGame,
    loadGame,
    handleChoice,
    handleCreatorIntervention,
    returnToTitle,
    setPrescienceCharges,
    setStoryFlags,
  };
};
