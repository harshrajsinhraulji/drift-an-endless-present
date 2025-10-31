"use client";

import {
  AlertDialog,
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
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl text-primary text-center">The End</AlertDialogTitle>
          <AlertDialogDescription className="text-lg text-foreground/80 pt-4 text-center">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onRestart} className="w-full font-headline text-lg" variant="outline">
            Return to Title
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
