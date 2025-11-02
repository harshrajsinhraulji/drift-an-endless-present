
"use client";

import { useState, useEffect, useContext, useRef, useCallback } from "react";
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
import { useCheckpoint } from "@/hooks/useCheckpoint";

export default function Game() {
  const { user, isUserLoading } = useUser();
  const [hasSave, setHasSave] = useState(false);
  const [isCheckingSave, setIsCheckingSave] = useState(true);

  const {
    loadCheckpoint,
    deleteCheckpoint,
  } = useCheckpoint(user, hasSave, setHasSave, setIsCheckingSave);

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
    gameOverCause,
    startGame,
    loadGame,
    handleChoice,
    handleCreatorIntervention,
    returnToTitle,
    tutorialCompleted,
  } = useGame({ user, setHasSave });


  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const { bgmVolume } = useContext(SoundContext);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!bgmAudioRef.current) {
      bgmAudioRef.current = new Audio('/assets/sounds/bgm.mp3');
      bgmAudioRef.current.loop = true;
      bgmAudioRef.current.addEventListener('error', () => {
        if(bgmAudioRef.current) bgmAudioRef.current.src = ""; // Prevent further load attempts
      });
    }
     if (!endAudioRef.current) {
      endAudioRef.current = new Audio('/assets/sounds/end.mp3');
      endAudioRef.current.addEventListener('error', () => {
        if(endAudioRef.current) endAudioRef.current.src = ""; // Prevent further load attempts
      });
    }
  }, []);
  
  useEffect(() => {
    if (bgmAudioRef.current && bgmAudioRef.current.src) {
      const shouldPlayBGM = (gameState === 'playing' || gameState === 'title' || gameState === 'creator_intervention') && bgmVolume > 0;
      if (shouldPlayBGM) {
        bgmAudioRef.current.volume = bgmVolume;
        bgmAudioRef.current.play().catch(e => {});
      } else {
        bgmAudioRef.current.pause();
      }
    }
    
    if (endAudioRef.current && endAudioRef.current.src && gameState === 'gameover') {
        if (bgmAudioRef.current) bgmAudioRef.current.pause();
        endAudioRef.current.volume = bgmVolume; // Use BGM volume for ending cinematic
        endAudioRef.current.play().catch(e => {});
    }

  }, [gameState, bgmVolume]);

  const currentCard = deck[currentCardIndex];
  const cardText = currentCard ? getCardText(currentCard, resources) : "";
  const creatorCard = gameCards.find(c => c.id === 302);
  
  const handleStart = () => {
    startGame(tutorialCompleted);
  }

  const handleContinue = async () => {
    const checkpoint = await loadCheckpoint();
    if (checkpoint) {
      loadGame(checkpoint);
    }
  }

  const handleDelete = async () => {
    await deleteCheckpoint();
  }

  if (isUserLoading || isCheckingSave) {
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

  if (gameState === "title") {
    return <TitleScreen onStart={handleStart} onContinue={handleContinue} hasSave={hasSave} onDeleteSave={handleDelete} gameState={gameState} />;
  }
  
  if (isGameLoading) {
     return (
        <div className="flex flex-col gap-6 h-[600px] w-full max-w-2xl items-center justify-center">
            <div className="w-full h-10" />
            <div className="flex h-[470px] w-full items-center justify-center rounded-lg bg-card/50">
                <h1 className="font-headline text-2xl text-primary animate-pulse">LOADING REIGN...</h1>
            </div>
            <div className="h-8" />
        </div>
    );
  }

  if (gameState === "creator_intervention" && creatorCard) {
    return (
       <div className="flex flex-col gap-6 items-center w-full max-w-2xl">
        <div className="w-full mx-auto flex flex-col gap-6 z-10">
          <ResourceDisplay resources={resources} effects={{}} gameOverCause={null} />
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
      <div className={cn("w-full mx-auto flex flex-col gap-6 z-10 transition-all duration-1000", gameState === 'gameover' ? "opacity-30 blur-sm" : "opacity-100")}>
        <ResourceDisplay resources={resources} effects={lastEffects} gameOverCause={gameOverCause}/>
        {currentCard && gameState === 'playing' && (
            <NarrativeCard
              key={currentCard.id}
              card={{ ...currentCard, text: cardText}}
              onChoice={handleChoice}
              showPrescience={prescienceCharges > 0}
              isFirstTurn={year === 0 && currentCard.id === 0}
            />
        )}
      </div>
      <p className="text-primary font-headline text-2xl h-8 transition-opacity duration-300" style={{opacity: gameState !== 'playing' || (currentCard?.id === 0 || currentCard?.id === 304) ? 0 : 1}}>Year {year}</p>
      <GameOverDialog 
        isOpen={gameState === "gameover"} 
        message={gameOverMessage} 
        onRestart={returnToTitle} 
        year={year} 
        cause={gameOverCause} 
       />
       <div className="absolute bottom-4 right-4 flex items-center gap-4">
            {prescienceCharges > 0 && (
                <div className="flex items-center gap-2 text-primary/80 animate-pulse">
                    <Eye className="w-5 h-5" />
                    <span className="font-headline text-lg">{prescienceCharges}</span>
                </div>
            )}
            <Button onClick={() => setIsStoryDialogOpen(true)} variant="outline" size="sm" className="text-xs font-headline">
                Story
            </Button>
      </div>
      <StoryProgressDialog isOpen={isStoryDialogOpen} onClose={() => setIsStoryDialogOpen(false)} flags={Array.from(storyFlags)} />
    </div>
  );
}
