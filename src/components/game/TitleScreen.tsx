
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SettingsDialog from "./SettingsDialog";
import { Settings } from "lucide-react";

interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
}

export default function TitleScreen({ onStart, onContinue, hasSave }: TitleScreenProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl animate-in fade-in-0 duration-500">
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-headline text-5xl text-primary tracking-wider">DRIFT</h1>
        <p className="font-body text-lg text-foreground/80">An Endless Present</p>
      </div>
      <div className="flex flex-col gap-4 mt-16 w-full max-w-xs">
        {hasSave && (
          <Button onClick={onContinue} className="w-full font-headline text-xl" variant="outline">
            Continue
          </Button>
        )}
        <Button onClick={onStart} className="w-full font-headline text-xl" variant="outline">
          {hasSave ? "New Game" : "Begin"}
        </Button>
         <Button onClick={() => setIsSettingsOpen(true)} className="w-full font-headline text-xl" variant="ghost">
            Settings
          </Button>
      </div>
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

    
