"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";

interface GameOverDialogProps {
  isOpen: boolean;
  message: string;
  onRestart: () => void;
}

export default function GameOverDialog({ isOpen, message, onRestart }: GameOverDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="accent-glow">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl text-glow">Reign Over</AlertDialogTitle>
          <AlertDialogDescription className="text-lg text-foreground/80 pt-4">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onRestart} className="w-full font-headline text-lg">
            Try Again
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
