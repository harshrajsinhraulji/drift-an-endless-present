"use client";

import { useState, useEffect, useCallback } from "react";
import type { ResourceId, CardData, Choice, StoryFlag } from "@/lib/game-data";
import { gameCards, specialEventCards, INITIAL_RESOURCE_VALUE, gameOverConditions } from "@/lib/game-data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import ResourceDisplay from "./ResourceDisplay";
import NarrativeCard from "./NarrativeCard";
import GameOverDialog from "./GameOverDialog";
import TitleScreen from "./TitleScreen";
import StoryProgressDialog from "./StoryProgressDialog";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";


type Resources = Record<ResourceId, number>;
type GameState = "title" | "playing" | "gameover" | "creator_intervention";
type StoryFlags = Set<StoryFlag>;

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const SAVE_GAME_KEY = "lapse-save-game";

// Helper function to convert Set to Array for JSON serialization
const storyFlagsToJSON = (flags: StoryFlags) => Array.from(flags);
// Helper function to convert Array back to Set after JSON parsing
const storyFlagsFromJSON = (flags: StoryFlag[]) => new Set(flags);


export default function GameContainer() {
  const [resources, setResources] = useState<Resources>({
    environment: INITIAL_RESOURCE_VALUE,
    people: INITIAL_RESOURCE_VALUE,
    army: INITIAL_RESOURCE_VALUE,
    money: INITIAL_RESOURCE_VALUE,
  });
  const [deck, setDeck] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>("title");
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [lastEffects, setLastEffects] = useState<Partial<Record<ResourceId, number>>>({});
  const [year, setYear] = useState(1);
  const [hasSave, setHasSave] = useState(false);
  const [storyFlags, setStoryFlags] = useState<StoryFlags>(new Set());
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [prescienceTurns, setPrescienceTurns] = useState(0);

  useEffect(() => {
    setIsClient(true);
    if (localStorage.getItem(SAVE_GAME_KEY)) {
      setHasSave(true);
    }
  }, []);

  const startNewGame = useCallback(() => {
    setResources({
      environment: INITIAL_RESOURCE_VALUE,
      people: INITIAL_RESOURCE_VALUE,
      army: INITIAL_RESOURCE_VALUE,
      money: INITIAL_RESOURCE_VALUE,
    });
    // Shuffle main cards and prepend shuffled special event cards
    const shuffledSpecialEvents = shuffleArray(specialEventCards);
    const shuffledMainDeck = shuffleArray(gameCards.filter(c => !c.requiredFlags && !c.isSpecial));
    setDeck([...shuffledSpecialEvents, ...shuffledMainDeck]);
    setCurrentCardIndex(0);
    setGameState("playing");
    setGameOverMessage("");
    setLastEffects({});
    setYear(1);
    setStoryFlags(new Set());
    setPrescienceTurns(0);
  }, []);

  const loadGame = useCallback(() => {
    if (!isClient) return;
    const savedState = localStorage.getItem(SAVE_GAME_KEY);
    if (savedState) {
      const { resources, deck, currentCardIndex, year, storyFlags, prescienceTurns } = JSON.parse(savedState);
      setResources(resources);
      setDeck(deck);
      setCurrentCardIndex(currentCardIndex);
      setYear(year);
      setStoryFlags(storyFlagsFromJSON(storyFlags || []));
      setPrescienceTurns(prescienceTurns || 0);
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
        prescienceTurns,
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveState));
      setHasSave(true);
    }
     if (isClient && gameState === "title") {
      localStorage.removeItem(SAVE_GAME_KEY);
      setHasSave(false);
    }
  }, [resources, deck, currentCardIndex, year, storyFlags, gameState, isClient, prescienceTurns]);


  const getNextCard = () => {
    let potentialDeck = [...deck];
    let potentialIndex = currentCardIndex + 1;
  
    // Function to check if a card is valid to be drawn
    const isCardValid = (card: CardData) => {
      const alreadyInDeck = deck.some(dCard => dCard.id === card.id);
      const requiredFlagsMet = !card.requiredFlags || card.requiredFlags.every(flag => storyFlags.has(flag));
      const blockedByFlagsMet = !card.blockedByFlags || !card.blockedByFlags.some(flag => storyFlags.has(flag));
      return !alreadyInDeck && requiredFlagsMet && blockedByFlagsMet;
    };
  
    // Check for story-specific cards that should be injected
    const storyCardsToInject = gameCards.filter(isCardValid);
  
    if (storyCardsToInject.length > 0) {
      // Inject the first valid story card to be the next one
      const newDeck = [...deck.slice(0, potentialIndex), ...storyCardsToInject, ...deck.slice(potentialIndex)];
      setDeck(newDeck);
      return potentialIndex;
    }
  
    // If no story card, or we are at the end of the deck, reshuffle and continue
    if (potentialIndex >= potentialDeck.length) {
      const seenCardIds = new Set(potentialDeck.map(c => c.id));
      const unseenMainCards = gameCards.filter(c => !c.isSpecial && !seenCardIds.has(c) && !c.requiredFlags);
      const newShuffledMainDeck = shuffleArray(unseenMainCards.length > 0 ? unseenMainCards : gameCards.filter(c => !c.isSpecial && !c.requiredFlags));
      
      const newDeck = [...potentialDeck, ...newShuffledMainDeck];
      setDeck(newDeck);
    }
    
    // Make sure the next card is valid with the current flags
    while(potentialDeck[potentialIndex] && potentialDeck[potentialIndex].blockedByFlags?.some(flag => storyFlags.has(flag))) {
        potentialIndex++;
        if (potentialIndex >= potentialDeck.length) {
             const seenCardIds = new Set(potentialDeck.map(c => c.id));
             const unseenMainCards = gameCards.filter(c => !c.isSpecial && !seenCardIds.has(c) && !c.requiredFlags);
             const newShuffledMainDeck = shuffleArray(unseenMainCards.length > 0 ? unseenMainCards : gameCards.filter(c => !c.isSpecial && !c.requiredFlags));
      
            const newDeck = [...potentialDeck, ...newShuffledMainDeck];
            setDeck(newDeck);
        }
    }

    return potentialIndex;
  };

  const handleCreatorIntervention = (choice: Choice) => {
    if (choice.setFlag === 'creator_github_mercy') {
      setStoryFlags(prev => new Set(prev).add('creator_github_mercy'));
      setResources({
        environment: INITIAL_RESOURCE_VALUE,
        people: INITIAL_RESOURCE_VALUE,
        army: INITIAL_RESOURCE_VALUE,
        money: INITIAL_RESOURCE_VALUE,
      });
      setGameState('playing');
      setLastEffects({});
      setCurrentCardIndex(getNextCard());
    } else {
      setGameState("gameover");
    }
  }


  const handleChoice = (choice: Choice) => {
    if (gameState !== 'playing') return;

    setLastEffects(choice.effects);

    const newStoryFlags = new Set(storyFlags);
    if (choice.setFlag) {
      newStoryFlags.add(choice.setFlag);
      setStoryFlags(newStoryFlags);
      if (choice.setFlag === 'creator_linkedin_prescience') {
        setPrescienceTurns(10);
      }
    }

    if (prescienceTurns > 0) {
      setPrescienceTurns(p => p - 1);
    }

    let newResources = { ...resources };
    let gameOverTrigger = false;
    let message = "";

    for (const [resource, effect] of Object.entries(choice.effects)) {
      newResources[resource as ResourceId] = Math.max(0, Math.min(100, newResources[resource as ResourceId] + effect));
    }
    
    setResources(newResources);
    setYear(y => y + 1);

    // Special ending for the star child arc
    if (currentCard?.id === 201 && choice.text === "Embrace the power.") {
        gameOverTrigger = true;
        message = gameOverConditions.studied_star_ending;
    } else {
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


    if (gameOverTrigger) {
      setGameOverMessage(message);
      if (isClient) localStorage.removeItem(SAVE_GAME_KEY);

      if (!storyFlags.has('creator_github_mercy')) {
        setGameState("creator_intervention");
      } else {
        setGameState("gameover");
      }

    } else {
       setCurrentCardIndex(getNextCard());
    }
  };

  const returnToTitle = () => {
    setGameState("title");
  }

  const currentCard = deck[currentCardIndex];
  const cardImage = PlaceHolderImages.find(img => img.id === currentCard?.imageId);
  const creatorCard = gameCards.find(c => c.id === 302);
  const creatorCardImage = PlaceHolderImages.find(img => img.id === creatorCard?.imageId);
  
  if (!isClient) {
    return (
        <div className="flex flex-col gap-6 h-[600px] w-full max-w-sm items-center justify-center">
            <div className="w-full h-10" />
            <div className="flex h-[470px] w-full items-center justify-center rounded-lg bg-card/50">
                <h1 className="font-headline text-2xl text-primary">LOADING...</h1>
            </div>
            <div className="h-8" />
        </div>
    );
  }

  if (gameState === "title") {
    return <TitleScreen onStart={startNewGame} onContinue={loadGame} hasSave={hasSave} />;
  }

  if (gameState === "creator_intervention" && creatorCard) {
    return (
       <div className="flex flex-col gap-6 items-center">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-6 z-10">
          <ResourceDisplay resources={resources} effects={{}} />
          <NarrativeCard
            key={creatorCard.id}
            card={{ ...creatorCard, image: creatorCardImage?.imageUrl ?? '', imageHint: creatorCardImage?.imageHint ?? ''}}
            onChoice={handleCreatorIntervention}
            showPrescience={false}
          />
        </div>
        <p className="text-primary font-headline text-2xl h-8">{year}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className={cn("w-full max-w-sm mx-auto flex flex-col gap-6 z-10 transition-opacity duration-500", gameState === 'gameover' ? "opacity-30" : "opacity-100")}>
        <ResourceDisplay resources={resources} effects={lastEffects} />
        {currentCard && (
            <NarrativeCard
              key={currentCard.id}
              card={{ ...currentCard, image: cardImage?.imageUrl ?? '', imageHint: cardImage?.imageHint ?? ''}}
              onChoice={handleChoice}
              showPrescience={prescienceTurns > 0}
            />
        )}
      </div>
      <p className="text-primary font-headline text-2xl h-8 transition-opacity duration-300" style={{opacity: gameState !== 'playing' ? 0 : 1}}>{year}</p>
      <GameOverDialog isOpen={gameState === "gameover"} message={gameOverMessage} onRestart={returnToTitle} />
       <div className="absolute bottom-4 right-4">
          <Button onClick={() => setIsStoryDialogOpen(true)} variant="outline" className="text-xs font-headline">
            Year: {year}
          </Button>
      </div>
      <StoryProgressDialog isOpen={isStoryDialogOpen} onClose={() => setIsStoryDialogOpen(false)} flags={Array.from(storyFlags)} />
    </div>
  );
}
