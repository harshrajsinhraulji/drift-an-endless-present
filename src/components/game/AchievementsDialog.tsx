
"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { allAchievements, type Achievement, type UserAchievement } from "@/lib/achievements-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedAchievements: UserAchievement[];
}

const AchievementDisplay = ({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean; }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "p-4 rounded-lg border flex flex-col items-center justify-center gap-2 aspect-square transition-all duration-300",
                        unlocked ? "border-primary/50 bg-card/70" : "border-muted/50 bg-muted/30"
                    )}>
                        <div className="relative">
                            <achievement.icon className={cn(
                                "w-10 h-10",
                                unlocked ? "text-primary" : "text-muted-foreground"
                            )} />
                            {unlocked ? (
                                <Unlock className="absolute -bottom-1 -right-1 w-4 h-4 text-green-400 bg-card rounded-full p-0.5" />
                            ) : (
                                <Lock className="absolute -bottom-1 -right-1 w-4 h-4 text-muted-foreground bg-muted rounded-full p-0.5" />
                            )}
                        </div>
                        <p className={cn(
                            "text-sm font-headline text-center",
                            unlocked ? "text-foreground" : "text-muted-foreground"
                        )}>
                            {achievement.name}
                        </p>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">{unlocked ? achievement.description : "Keep playing to unlock."}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}


export default function AchievementsDialog({ isOpen, onClose, unlockedAchievements }: AchievementsDialogProps) {
  const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-primary text-center">Chronicles of Your Reign</DialogTitle>
          <DialogDescription className="text-lg text-foreground/80 pt-2 text-center">
            The moments that defined your legacy, etched into memory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-6">
            {allAchievements.map(ach => (
                <AchievementDisplay 
                    key={ach.id}
                    achievement={ach}
                    unlocked={unlockedIds.has(ach.id)}
                />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
