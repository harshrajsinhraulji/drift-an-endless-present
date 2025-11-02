
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { leaderboards } from "@/lib/leaderboard-data";
import LeaderboardDisplay from "./LeaderboardDisplay";
import { Separator } from "../ui/separator";

interface LeaderboardsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: { username: string; id: string; } | null;
}

export default function LeaderboardsDialog({ isOpen, onClose, userProfile }: LeaderboardsDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline text-3xl text-primary text-center">Legends of the Realm</DialogTitle>
                    <DialogDescription className="text-lg text-foreground/80 pt-2 text-center">
                        The chronicles of the greatest rulers.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-8 pt-6">
                    {leaderboards.map((lb, index) => (
                       <>
                        <LeaderboardDisplay
                            key={lb.id}
                            leaderboardId={lb.id}
                            title={lb.name}
                            icon={lb.icon}
                            userProfile={userProfile}
                        />
                        {index < leaderboards.length - 1 && <Separator />}
                       </>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
