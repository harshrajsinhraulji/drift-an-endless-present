
"use client";

import { useState, useEffect, useContext, useRef } from "react";
import type { Choice } from "@/lib/game-data";
import { gameCards, getCardText } from "@/lib/game-data";
import ResourceDisplay from "./ResourceDisplay";
import NarrativeCard from "./NarrativeCard";
import GameOverDialog from "./GameOverDialog";
import TitleScreen from "./TitleScreen";
import StoryProgressDialog from "./StoryProgressDialog";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import { SoundContext } from "@/contexts/SoundContext";
import { useGame } from '@/hooks/useGame';
import { useUser } from "@/firebase";

export default function Game() {
  const { user, isUserLoading } = useUser();
  const {
    resources,
    deck,
    currentCardIndex,
    gameState,
    gameOverMessage,
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
    hasSave,
    deleteSave,
  } = useGame(user);

  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [showPrescienceThisTurn, setShowPrescienceThisTurn] = useState(false);
  const [prescienceWasUsed, setPrescienceWasUsed] = useState(false);
  const { bgmVolume } = useContext(SoundContext);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
     if (!audioRef.current) {
      audioRef.current = new Audio('/assets/sounds/bgm.mp3');
      audioRef.current.loop = true;
    }
  }, []);
  
  useEffect(() => {
    if (audioRef.current) {
      if (gameState === 'playing' && bgmVolume > 0) {
        audioRef.current.volume = bgmVolume;
        audioRef.current.play().catch(e => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [gameState, bgmVolume]);
  
  const handleChoiceWithPrescience = (choice: Choice) => {
    if (prescienceWasUsed) {
      setPrescienceWasUsed(false);
    }
    setShowPrescienceThisTurn(false);
    handleChoice(choice);
  };

  const returnToTitleAndReset = () => {
    setShowPrescienceThisTurn(false);
    setPrescienceWasUsed(false);
    returnToTitle();
  }

  const togglePrescience = () => {
    if (prescienceCharges > 0) {
      if (!showPrescienceThisTurn) {
        setPrescienceWasUsed(true);
      }
      setShowPrescienceThisTurn(!showPrescienceThisTurn);
    }
  };

  const currentCard = deck[currentCardIndex];
  const cardText = currentCard ? getCardText(currentCard, resources) : "";
  const creatorCard = gameCards.find(c => c.id === 302);
  
  if (isUserLoading || (user && isGameLoading)) {
    return (
        <div className="flex flex-col gap-6 h-[600px] w-full max-w-2xl items-center justify-center">
            <div className="w-full h-10" />
            <div className="flex h-[470px] w-full items-center justify-center rounded-lg bg-card/50">
                <h1 className="font-headline text-2xl text-primary animate-pulse">LOADING...</h1>
            </div>
            <div className="h-8" />
        </div>
    );
  }

  if (!user || gameState === "title") {
    return <TitleScreen onStart={startGame} onContinue={loadGame} hasSave={hasSave} onDeleteSave={deleteSave} />;
  }
  
  if (gameState === "creator_intervention" && creatorCard) {
    return (
       <div className="flex flex-col gap-6 items-center w-full max-w-2xl">
        <div className="w-full mx-auto flex flex-col gap-6 z-10">
          <ResourceDisplay resources={resources} effects={{}} />
          <NarrativeCard
            key={creatorCard.id}
            card={{ ...creatorCard, text: getCardText(creatorCard, resources)}}
            onChoice={handleCreatorIntervention}
            showPrescience={false}
          />
        </div>
        <p className="text-primary font-headline text-2xl h-8">{year}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-2xl">
      <div className={cn("w-full mx-auto flex flex-col gap-6 z-10 transition-opacity duration-500", gameState === 'gameover' ? "opacity-30" : "opacity-100")}>
        <ResourceDisplay resources={resources} effects={lastEffects} />
        {currentCard && (
            <NarrativeCard
              key={currentCard.id}
              card={{ ...currentCard, text: cardText}}
              onChoice={handleChoiceWithPrescience}
              showPrescience={showPrescienceThisTurn}
              isFirstTurn={year === 1 && currentCard.id === 0}
            />
        )}
      </div>
      <p className="text-primary font-headline text-2xl h-8 transition-opacity duration-300" style={{opacity: gameState !== 'playing' || (currentCard?.id === 0 || currentCard?.id === 304) ? 0 : 1}}>{year}</p>
      <GameOverDialog isOpen={gameState === "gameover"} message={gameOverMessage} onRestart={returnToTitleAndReset} />
       <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {storyFlags.has('creator_linkedin_prescience') && (
              <Button onClick={togglePrescience} variant={showPrescienceThisTurn ? 'default' : 'outline'} size="sm" className="text-xs font-headline" disabled={prescienceCharges <= 0 && !showPrescienceThisTurn}>
                <Eye className="w-4 h-4 mr-1" />
                {prescienceCharges}
              </Button>
            )}
          <Button onClick={() => setIsStoryDialogOpen(true)} variant="outline" size="sm" className="text-xs font-headline">
            Year: {year}
          </Button>
      </div>
      <StoryProgressDialog isOpen={isStoryDialogOpen} onClose={() => setIsStoryDialogOpen(false)} flags={Array.from(storyFlags)} />
    </div>
  );
}
