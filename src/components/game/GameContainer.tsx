
"use client";

import { useState, useEffect } from "react";
import Game from "./Game";
import IntroScreen from "./IntroScreen";

const INTRO_SEEN_KEY = "drift-intro-seen";

export default function GameContainer() {
  const [showIntro, setShowIntro] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Use a try-catch block for localStorage in case of security restrictions
    try {
      if (localStorage.getItem(INTRO_SEEN_KEY)) {
        setShowIntro(false);
      }
    } catch (error) {
      console.warn("Could not access localStorage. Intro will be shown.", error);
      // If localStorage is blocked, we'll just show the intro every time.
      setShowIntro(true); 
    }
  }, []);

  const handleIntroComplete = () => {
    try {
      localStorage.setItem(INTRO_SEEN_KEY, "true");
    } catch (error)      {
      console.warn("Could not write to localStorage.", error);
    }
    setShowIntro(false);
  };
  
  if (!isMounted) {
    return null; // or a loading spinner
  }

  if (showIntro) {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  return <Game />;
}
