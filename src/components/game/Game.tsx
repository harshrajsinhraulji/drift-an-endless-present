
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
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from 'firebase/firestore';

export default function Game() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const [hasSave, setHasSave] = useState(false);
  const [isCheckingSave, setIsCheckingSave] = useState(true);

  const {
    resources,
    deck,
    currentCardIndex,
    gameState,
    setGameState,
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
    deleteSave,
    tutorialCompleted, 
    setTutorialCompleted
  } = useGame(user, hasSave, setHasSave);

  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const { bgmVolume } = useContext(SoundContext);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const checkSave = useCallback(async () => {
    if (!user || user.isAnonymous || !firestore) {
      setHasSave(false);
      setIsCheckingSave(false);
      return;
    }
    setIsCheckingSave(true);
    const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
    try {
      const docSnap = await getDoc(checkpointRef);
      const saveExists = docSnap.exists();
      setHasSave(saveExists);
      if (saveExists) {
        setTutorialCompleted(docSnap.data().tutorialCompleted || false);
      }
    } catch (error) {
      console.error("Error checking for save file:", error);
      setHasSave(false);
    } finally {
      setIsCheckingSave(false);
    }
  }, [user, firestore, setTutorialCompleted]);

  useEffect(() => {
    checkSave();
  }, [user, checkSave]);

  useEffect(() => {
     if (!audioRef.current) {
      audioRef.current = new Audio('/assets/sounds/bgm.mp3');
      audioRef.current.loop = true;
      audioRef.current.addEventListener('error', () => {
        if(audioRef.current) audioRef.current.src = ""; // Prevent further load attempts
      });
    }
  }, []);
  
  useEffect(() => {
    if (audioRef.current && audioRef.current.src) {
      if (gameState === 'playing' && bgmVolume > 0) {
        audioRef.current.volume = bgmVolume;
        audioRef.current.play().catch(e => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [gameState, bgmVolume]);
  
  const currentCard = deck[currentCardIndex];
  const cardText = currentCard ? getCardText(currentCard, resources) : "";
  const creatorCard = gameCards.find(c => c.id === 302);
  
  const handleStart = () => {
    startGame(tutorialCompleted);
  }

  const handleContinue = () => {
    loadGame();
  }

  const handleDelete = async () => {
    await deleteSave();
    // After deleting, we might want to start a new game immediately or just stay on title.
    // For now, stay on title screen.
  }

  const handleReturnToTitle = async () => {
      await returnToTitle();
      await checkSave(); // Re-check save status when returning to title
  }
  
  if (isUserLoading || isCheckingSave || (user && gameState !== 'title' && isGameLoading)) {
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
              onChoice={handleChoice}
              showPrescience={prescienceCharges > 0}
              isFirstTurn={year === 0 && currentCard.id === 0}
            />
        )}
      </div>
      <p className="text-primary font-headline text-2xl h-8 transition-opacity duration-300" style={{opacity: gameState !== 'playing' || (currentCard?.id === 0 || currentCard?.id === 304) ? 0 : 1}}>Year {year}</p>
      <GameOverDialog isOpen={gameState === "gameover"} message={gameOverMessage} onRestart={handleReturnToTitle} year={year} />
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

    