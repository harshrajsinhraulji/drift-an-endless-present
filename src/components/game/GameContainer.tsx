"use client";

import { useState, useEffect, useCallback } from "react";
import type { ResourceId, CardData, Choice } from "@/lib/game-data";
import { gameCards, INITIAL_RESOURCE_VALUE, gameOverConditions } from "@/lib/game-data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import ResourceDisplay from "./ResourceDisplay";
import NarrativeCard from "./NarrativeCard";
import GameOverDialog from "./GameOverDialog";
import { cn } from "@/lib/utils";

type Resources = Record<ResourceId, number>;

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function GameContainer() {
  const [resources, setResources] = useState<Resources>({
    environment: INITIAL_RESOURCE_VALUE,
    people: INITIAL_RESOURCE_VALUE,
    army: INITIAL_RESOURCE_VALUE,
    money: INITIAL_RESOURCE_VALUE,
  });
  const [deck, setDeck] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [lastEffects, setLastEffects] = useState<Partial<Record<ResourceId, number>>>({});

  useEffect(() => {
    setIsClient(true);
    startGame();
  }, []);

  const startGame = useCallback(() => {
    setResources({
      environment: INITIAL_RESOURCE_VALUE,
      people: INITIAL_RESOURCE_VALUE,
      army: INITIAL_RESOURCE_VALUE,
      money: INITIAL_RESOURCE_VALUE,
    });
    setDeck(shuffleArray(gameCards));
    setCurrentCardIndex(0);
    setGameOver(false);
    setGameOverMessage("");
    setLastEffects({});
  }, []);

  const handleChoice = (choice: Choice) => {
    if (gameOver) return;

    setLastEffects(choice.effects);

    let newResources = { ...resources };
    let gameOverTrigger = false;
    let message = "";

    for (const [resource, effect] of Object.entries(choice.effects)) {
      newResources[resource as ResourceId] = Math.max(0, Math.min(100, newResources[resource as ResourceId] + effect));
    }
    
    setResources(newResources);

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

    if (gameOverTrigger) {
      setGameOver(true);
      setGameOverMessage(message);
    } else {
        if (currentCardIndex === deck.length - 1) {
            setDeck(shuffleArray(gameCards));
            setCurrentCardIndex(0);
        } else {
            setCurrentCardIndex(prev => prev + 1);
        }
    }
  };

  const currentCard = deck[currentCardIndex];
  const cardImage = PlaceHolderImages.find(img => img.id === currentCard?.imageId);

  if (!isClient || !currentCard) {
    return (
        <div className="flex h-[600px] w-full max-w-sm items-center justify-center rounded-lg bg-card/50">
            <h1 className="font-headline text-2xl text-primary">LOADING...</h1>
        </div>
    );
  }

  return (
    <div className={cn("w-full max-w-sm mx-auto flex flex-col gap-6 z-10 transition-opacity duration-500", gameOver ? "opacity-30" : "opacity-100")}>
      <ResourceDisplay resources={resources} effects={lastEffects} />
      <NarrativeCard
        key={currentCard.id}
        card={{ ...currentCard, image: cardImage?.imageUrl ?? '', imageHint: cardImage?.imageHint ?? ''}}
        onChoice={handleChoice}
      />
      <GameOverDialog isOpen={gameOver} message={gameOverMessage} onRestart={startGame} />
    </div>
  );
}
