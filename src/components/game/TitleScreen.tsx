
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SettingsDialog from "./SettingsDialog";
import { Settings, Github, Linkedin, Cog } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
}

export default function TitleScreen({ onStart, onContinue, hasSave }: TitleScreenProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center justify-between h-full w-full max-w-2xl animate-in fade-in-0 duration-500 overflow-hidden p-6">
      
      {/* Background visual element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-96 h-96">
            <div className="absolute inset-0 border-[2px] border-primary/10 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-8 border-[1px] border-primary/10 rounded-full animate-spin-slow [animation-direction:reverse]"></div>
            <div className="absolute inset-16 border-[1px] border-primary/5 rounded-full animate-spin-slow"></div>
        </div>
      </div>

      {/* Spacer to push content down */}
      <div />

      <div className="z-10 flex flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center gap-2 mb-16 text-center">
          <h1 className="font-headline text-6xl text-primary tracking-wider">DRIFT</h1>
          <p className="font-body text-xl text-foreground/80">An Endless Present</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          {hasSave && (
            <Button onClick={onContinue} className="w-full font-headline text-xl" variant="outline" size="lg">
              Continue
            </Button>
          )}
          <Button onClick={onStart} className="w-full font-headline text-xl" variant="outline" size="lg">
            {hasSave ? "New Game" : "Begin"}
          </Button>
        </div>
      </div>
      
      <div className="w-full flex justify-center items-center gap-6 z-10">
         <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" size="icon" className="text-foreground/60 hover:text-primary">
            <Cog className="w-6 h-6" />
            <span className="sr-only">Settings</span>
        </Button>
        <Link href="https://github.com/harshrajsinhraulji" target="_blank" rel="noopener noreferrer" className={cn(
            "text-foreground/60 hover:text-primary transition-colors",
        )}>
            <Github className="w-6 h-6" />
            <span className="sr-only">GitHub</span>
        </Link>
         <Link href="https://www.linkedin.com/in/harshrajsinhraulji" target="_blank" rel="noopener noreferrer" className={cn(
            "text-foreground/60 hover:text-primary transition-colors",
        )}>
            <Linkedin className="w-6 h-6" />
            <span className="sr-only">LinkedIn</span>
        </Link>
      </div>

      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
