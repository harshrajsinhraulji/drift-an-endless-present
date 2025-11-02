
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
}

export default function GameOverDialog({ isOpen, message, onRestart, year }: GameOverDialogProps) {
  let iconId: ResourceId | 'star' | null = null;
  if (message.includes("land has withered")) iconId = "environment";
  if (message.includes("Nature has reclaimed")) iconId = "environment";
  if (message.includes("people have revolted")) iconId = "people";
  if (message.includes("adoration has turned to fanaticism")) iconId = "people";
  if (message.includes("defenseless, has been conquered")) iconId = "army";
  if (message.includes("army has seized control")) iconId = "army";
  if (message.includes("kingdom is bankrupt")) iconId = "money";
  if (message.includes("Economic collapse")) iconId = "money";
  if (message.includes("You merged with the cosmic entity")) iconId = "star";
  
  const Icon = iconId ? resourceIcons[iconId] : null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-2xl">
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
