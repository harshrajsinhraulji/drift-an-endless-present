
"use client";

import { useState, useEffect } from 'react';
import IntroScreen from './IntroScreen';
import Game from './Game';

const INTRO_SEEN_KEY = 'drift-intro-seen';

export default function GameContainer() {
  const [showIntro, setShowIntro] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const introSeen = localStorage.getItem(INTRO_SEEN_KEY);
      if (introSeen === 'true') {
        setShowIntro(false);
      }
    } catch (error) {
      console.error("Could not read from localStorage", error);
      // If we can't read LS, default to not showing intro to avoid breaking the game
      setShowIntro(false);
    }
  }, []);

  const handleIntroFinish = () => {
    try {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch (error) {
      console.error("Could not write to localStorage", error);
    }
    setShowIntro(false);
  };

  if (!isClient) {
    // Render a static loader on the server to avoid hydration mismatch
    return (
      <div className="flex flex-col gap-6 h-[600px] w-full max-w-2xl items-center justify-center">
        <div className="w-full h-10" />
        <div className="flex h-[470px] w-full items-center justify-center rounded-lg bg-card/50">
          <h1 className="font-headline text-2xl text-primary">LOADING...</h1>
        </div>
        <div className="h-8" />
      </div>
    );
  }

  if (showIntro) {
    return <IntroScreen onFinish={handleIntroFinish} />;
  }

  return <Game />;
}
