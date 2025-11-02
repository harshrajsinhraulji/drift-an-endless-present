
"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { SoundContext } from "@/contexts/SoundContext";

interface IntroScreenProps {
  onComplete: () => void;
}

const phrases = [
  "The river flows.",
  "The sand shifts.",
  "A kingdom forgets its own name.",
  "Time is a flat circle.",
  "And you are its center.",
  "Rule.",
];

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { bgmVolume } = useContext(SoundContext);

  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio('/assets/sounds/intro.mp3');
        audioRef.current.loop = false;
    }

    const audio = audioRef.current;

    const handleAudioPlay = () => {
        if(audio.volume > 0) {
            audio.play().catch(e => console.error("Intro audio failed to play:", e));
        }
    };
    
    handleAudioPlay();

    const timeouts = phrases.map((_, index) => {
      return setTimeout(() => {
        setPhraseIndex(index);
      }, (index + 1) * 2500); // Phrases appear every 2.5 seconds
    });

    const buttonTimeout = setTimeout(() => {
      setShowButton(true);
    }, phrases.length * 2500 + 1000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(buttonTimeout);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
     if(audioRef.current) {
        audioRef.current.volume = bgmVolume;
     }
  }, [bgmVolume]);

  const handleComplete = () => {
    if (audioRef.current) {
        const audio = audioRef.current;
        let fadeOut = setInterval(() => {
            if (audio.volume > 0.1) {
                audio.volume -= 0.1;
            } else {
                audio.pause();
                audio.volume = bgmVolume; // reset for next time
                clearInterval(fadeOut);
                onComplete();
            }
        }, 50);
    } else {
        onComplete();
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-[600px] w-full max-w-2xl text-center overflow-hidden">
      <div className="flex-grow flex items-center justify-center">
        <div className="relative w-full h-24">
            {phrases.map((phrase, index) => (
            <p
                key={index}
                className={cn(
                "absolute inset-0 font-headline text-3xl text-primary transition-opacity duration-1000 ease-in-out",
                phraseIndex === index ? "opacity-100 animate-in fade-in-0 slide-in-from-bottom-5" : "opacity-0"
                )}
            >
                {phrase}
            </p>
            ))}
        </div>
      </div>
      <div className="h-20">
      {showButton && (
        <Button onClick={handleComplete} variant="ghost" className="font-headline text-lg animate-in fade-in-0">
          Begin
        </Button>
      )}
      </div>
    </div>
  );
}
