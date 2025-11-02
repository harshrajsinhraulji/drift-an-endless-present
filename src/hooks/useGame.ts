
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ResourceId, CardData, Choice, StoryFlag } from '@/lib/game-data';
import {
  gameCards,
  INITIAL_RESOURCE_VALUE,
  gameOverConditions,
} from '@/lib/game-data';

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

const SAVE_GAME_KEY = 'drift-save-game';

// Helper function to convert Set to Array for JSON serialization
const storyFlagsToJSON = (flags: StoryFlags) => Array.from(flags);
// Helper function to convert Array back to Set after JSON parsing
const storyFlagsFromJSON = (flags: StoryFlag[]) => new Set(flags);

export const useGame = () => {
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
  const [hasSave, setHasSave] = useState(false);
  const [storyFlags, setStoryFlags] = useState<StoryFlags>(new Set());
  const [prescienceCharges, setPrescienceCharges] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (localStorage.getItem(SAVE_GAME_KEY)) {
      setHasSave(true);
    }
  }, []);

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

  const loadGame = useCallback(() => {
    if (!isClient) return;
    const savedState = localStorage.getItem(SAVE_GAME_KEY);
    if (savedState) {
      const { resources, deck, currentCardIndex, year, storyFlags, prescienceCharges } = JSON.parse(savedState);
      setResources(resources);
      setDeck(deck);
      setCurrentCardIndex(currentCardIndex);
      setYear(year);
      setStoryFlags(storyFlagsFromJSON(storyFlags || []));
      setPrescienceCharges(prescienceCharges || 0);
      setGameState("playing");
      setLastEffects({});
      setGameOverMessage("");
    } else {
      startNewGame();
    }
  }, [isClient, startNewGame]);

  useEffect(() => {
    if (isClient && gameState === "playing") {
      const saveState = {
        resources,
        deck,
        currentCardIndex,
        year,
        storyFlags: storyFlagsToJSON(storyFlags),
        prescienceCharges,
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveState));
      setHasSave(true);
    }
     if (isClient && (gameState === "title" || gameState === "gameover")) {
      localStorage.removeItem(SAVE_GAME_KEY);
      setHasSave(false);
    }
  }, [resources, deck, currentCardIndex, year, storyFlags, gameState, isClient, prescienceCharges]);


  const getNextCard = useCallback(() => {
    let nextIndex = currentCardIndex + 1;
    let newDeck = [...deck];

    // Function to find the next valid card in the current deck
    const findNextValidCardIndex = (startIndex: number, currentDeck: CardData[]) => {
        let i = startIndex;
        while (i < currentDeck.length) {
            const card = currentDeck[i];
            if (!card) return -1; // Added safety check
            const isBlocked = card.blockedByFlags?.some(flag => storyFlags.has(flag));
            if (!isBlocked) {
                return i;
            }
            i++;
        }
        return -1; // No valid card found
    };
    
    // Check for any story cards that must be injected now
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
    
    // If no valid card is found, it's time to reshuffle.
    if (validNextIndex === -1) {
        // Get all non-special, non-story-arc cards that have been seen
        const seenStandardCardIds = new Set(deck.slice(0, nextIndex).map(c => c.id));
        const reshuffleableCards = gameCards.filter(c => 
            !c.isSpecial && 
            !c.requiredFlags && 
            seenStandardCardIds.has(c.id) &&
            c.id !== 0 // Don't reshuffle tutorial card
        );

        const newShuffledCards = shuffleArray(reshuffleableCards);
        
        // Append the reshuffled cards to the deck
        const reshuffledDeck = [...newDeck, ...newShuffledCards];
        setDeck(reshuffledDeck);
        
        // Find the next valid card in the newly extended deck
        validNextIndex = findNextValidCardIndex(nextIndex, reshuffledDeck);
    }

    return validNextIndex;
  }, [currentCardIndex, deck, storyFlags]);

  const handleCreatorIntervention = useCallback((choice: Choice) => {
    if (choice.action) choice.action();
    
    if (choice.setFlag === 'creator_github_mercy') {
      const newFlags = new Set(storyFlags);
      newFlags.add('creator_github_mercy');
      
      setResources({
        environment: INITIAL_RESOURCE_VALUE,
        people: INITIAL_RESOURCE_VALUE,
        army: INITIAL_RESOURCE_VALUE,
        money: INITIAL_RESOURCE_VALUE,
      });

      const regularCards = gameCards.filter(c => c.id !== 0 && !c.isSpecial);
      const shuffledMainDeck = shuffleArray(regularCards);

      // Inject the 'thank you' card
      const thankYouCard = gameCards.find(c => c.id === 304);
      const finalDeck = thankYouCard ? [thankYouCard, ...shuffledMainDeck] : shuffledMainDeck;

      setDeck(finalDeck);
      setCurrentCardIndex(0);
      setGameState("playing");
      setGameOverMessage("");
      setLastEffects({});
      setStoryFlags(newFlags);
      setPrescienceCharges(newFlags.has('creator_linkedin_prescience') ? 10 : 0);
      // The year is intentionally NOT reset here to give a "second chance"

    } else {
      // If they refuse help, it's game over for real.
      setGameState("gameover");
    }
  }, [storyFlags]);


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
    
    // Only advance the year for non-special, non-tutorial cards
    if (currentCard.id !== 0 && currentCard.id !== 304) {
      setYear(y => y + 1);
    }


    // Special ending for the star child arc
    if (currentCard?.id === 201 && choice.text.includes("Embrace")) {
        gameOverTrigger = true;
        message = gameOverConditions.studied_star_ending;
    } else if (year + 1 >= 50) { // Check against upcoming year
        // Golden Age Victory Condition
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
    
    // Mercy mechanic for low resources
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
      if (isClient) localStorage.removeItem(SAVE_GAME_KEY);

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
         // This should theoretically not be reached with the new logic, but as a fallback:
         setGameOverMessage("You have seen all that this timeline has to offer. The world fades to dust.");
         setGameState("gameover");
       }
    }
  }, [deck, currentCardIndex, gameState, storyFlags, resources, year, getNextCard, isClient]);

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
    isClient,
    startNewGame,
    loadGame,
    handleChoice,
    handleCreatorIntervention,
    returnToTitle,
    setPrescienceCharges,
    setStoryFlags,
  };
};

    