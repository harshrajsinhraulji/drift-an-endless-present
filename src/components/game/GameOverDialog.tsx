
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
import type { ResourceId } from "@/lib/game-data";
import { Leaf, Users, Shield, CircleDollarSign, Star } from "lucide-react";
import { cn } from "@/lib/utils";


const resourceIcons: Record<ResourceId | 'star', React.ElementType> = {
  environment: Leaf,
  people: Users,
  army: Shield,
  money: CircleDollarSign,
  star: Star,
};


interface GameOverDialogProps {
  isOpen: boolean;
  message: string;
  onRestart: () => void;
  year: number;
  cause: ResourceId | 'star' | null;
}

export default function GameOverDialog({ isOpen, message, onRestart, year, cause }: GameOverDialogProps) {
  const Icon = cause ? resourceIcons[cause] : null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-2xl animate-in fade-in-0 duration-1000">
        <AlertDialogHeader>
            {Icon && (
                <div className="mx-auto mb-4">
                    <Icon className="w-16 h-16 text-primary/80" />
                </div>
            )}
          <AlertDialogTitle className="font-headline text-2xl text-primary text-center">The End</AlertDialogTitle>
           <p className="text-center text-muted-foreground font-headline text-lg">You reigned for {year} years.</p>
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
