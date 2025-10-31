"use client";

import { useState, useEffect, useCallback } from "react";
import type { ResourceId, CardData, Choice, StoryFlag } from "@/lib/game-data";
import { gameCards, specialEventCards, INITIAL_RESOURCE_VALUE, gameOverConditions } from "@/lib/game-data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import ResourceDisplay from "./ResourceDisplay";
import NarrativeCard from "./NarrativeCard";
import GameOverDialog from "./GameOverDialog";
import TitleScreen from "./TitleScreen";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


type Resources = Record<ResourceId, number>;
type GameState = "title" | "playing" | "gameover";
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

  useEffect(() => {
    setIsClient(true);
    if (localStorage.getItem(SAVE_GAME_KEY)) {
      setHasSave(true);
    }
  }, []);

  useEffect(() => {
    if (isClient && gameState === "playing") {
      const saveState = {
        resources,
        deck,
        currentCardIndex,
        year,
        storyFlags: storyFlagsToJSON(storyFlags),
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveState));
      setHasSave(true);
    }
     if (isClient && gameState === "title") {
      localStorage.removeItem(SAVE_GAME_KEY);
      setHasSave(false);
    }
  }, [resources, deck, currentCardIndex, year, storyFlags, gameState, isClient]);

  const loadGame = useCallback(() => {
    if (!isClient) return;
    const savedState = localStorage.getItem(SAVE_GAME_KEY);
    if (savedState) {
      const { resources, deck, currentCardIndex, year, storyFlags } = JSON.parse(savedState);
      setResources(resources);
      setDeck(deck);
      setCurrentCardIndex(currentCardIndex);
      setYear(year);
      setStoryFlags(storyFlagsFromJSON(storyFlags || []));
      setGameState("playing");
      setLastEffects({});
      setGameOverMessage("");
    } else {
      startNewGame();
    }
  }, [isClient]);

  const startNewGame = useCallback(() => {
    setResources({
      environment: INITIAL_RESOURCE_VALUE,
      people: INITIAL_RESOURCE_VALUE,
      army: INITIAL_RESOURCE_VALUE,
      money: INITIAL_RESOURCE_VALUE,
    });
    // Shuffle main cards and prepend shuffled special event cards
    const shuffledSpecialEvents = shuffleArray(specialEventCards);
    const shuffledMainDeck = shuffleArray(gameCards);
    setDeck([...shuffledSpecialEvents, ...shuffledMainDeck]);
    setCurrentCardIndex(0);
    setGameState("playing");
    setGameOverMessage("");
    setLastEffects({});
    setYear(1);
    setStoryFlags(new Set());
  }, []);

  const getNextCardIndex = (currentIndex: number, currentDeck: CardData[], currentFlags: StoryFlags): number => {
    let nextIndex = currentIndex + 1;

    // Check for story-specific cards
    const potentialStoryCards = gameCards.filter(
        card => card.requiredFlags && card.requiredFlags.every(flag => currentFlags.has(flag)) && !currentDeck.some(dCard => dCard.id === card.id)
    );

    if (potentialStoryCards.length > 0) {
        // For simplicity, we're just adding the first one found.
        // A more complex system might have priorities or multiple insertions.
        const storyCard = potentialStoryCards[0];
        // Insert the story card into the deck to be the next card
        const newDeck = [...currentDeck.slice(0, currentIndex + 1), storyCard, ...currentDeck.slice(currentIndex + 1)];
        setDeck(newDeck);
        return currentIndex + 1;
    }

    if (nextIndex >= currentDeck.length) {
      // Reshuffle main deck and append it. Don't re-add special events.
      const newShuffledMainDeck = shuffleArray(gameCards.filter(c => !c.requiredFlags));
      setDeck([...currentDeck, ...newShuffledMainDeck]);
    }
    
    return nextIndex;
  };

  const handleChoice = (choice: Choice) => {
    if (gameState !== 'playing') return;

    setLastEffects(choice.effects);

    if (choice.setFlag) {
      setStoryFlags(prev => new Set(prev).add(choice.setFlag));
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
    if (choice.setFlag === "studied_star" && newResources.people <= 0) {
        gameOverTrigger = true;
        message = gameOverConditions.studied_star_ending;
    } else if (currentCard?.id === 201 && choice.text === "Embrace the power.") {
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
      setGameState("gameover");
      setGameOverMessage(message);
      if(isClient) localStorage.removeItem(SAVE_GAME_KEY);
    } else {
       setCurrentCardIndex(prev => getNextCardIndex(prev, deck, new Set(storyFlags).add(choice.setFlag as StoryFlag)));
    }
  };

  const returnToTitle = () => {
    setGameState("title");
  }

  const currentCard = deck[currentCardIndex];
  const cardImage = PlaceHolderImages.find(img => img.id === currentCard?.imageId);
  
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

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className={cn("w-full max-w-sm mx-auto flex flex-col gap-6 z-10 transition-opacity duration-500", gameState === 'gameover' ? "opacity-30" : "opacity-100")}>
        <ResourceDisplay resources={resources} effects={lastEffects} />
        {currentCard && (
            <NarrativeCard
              key={currentCard.id}
              card={{ ...currentCard, image: cardImage?.imageUrl ?? '', imageHint: cardImage?.imageHint ?? ''}}
              onChoice={handleChoice}
            />
        )}
      </div>
      <p className="text-primary font-headline text-2xl h-8 transition-opacity duration-300" style={{opacity: gameState !== 'playing' ? 0 : 1}}>{year}</p>
      <GameOverDialog isOpen={gameState === "gameover"} message={gameOverMessage} onRestart={returnToTitle} />
       <div className="absolute bottom-4 right-4">
        <Badge variant="outline" className="text-xs font-headline">Year: AD 2024</Badge>
      </div>
    </div>
  );
}
