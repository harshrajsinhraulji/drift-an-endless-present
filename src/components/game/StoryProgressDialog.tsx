"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StoryFlag } from "@/lib/game-data";

interface StoryProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  flags: StoryFlag[];
}

const flagDescriptions: Record<StoryFlag, string> = {
    studied_star: "You chose to study the fallen star, unlocking cosmic secrets.",
    met_astronomer: "You have consulted with the royal astronomers.",
    creator_github_mercy: "The Creator granted you a second chance.",
    creator_linkedin_prescience: "The Creator gave you the gift of foresight for a decade.",
}

export default function StoryProgressDialog({ isOpen, onClose, flags }: StoryProgressDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary text-center">Story Memories</DialogTitle>
          <DialogDescription className="text-lg text-foreground/80 pt-4 text-center">
            Your choices have shaped your journey. These are the key moments you've created.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4">
            {flags.length > 0 ? (
                flags.map(flag => (
                    <div key={flag} className="p-3 rounded-md border border-primary/20 bg-card/50">
                        <p className="font-body text-base text-foreground">{flagDescriptions[flag] || `An important event occurred: ${flag}`}</p>
                    </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground font-body">Your story is just beginning. No significant memories have been made... yet.</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
