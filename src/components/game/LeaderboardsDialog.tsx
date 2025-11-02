
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { leaderboards } from "@/lib/leaderboard-data";
import LeaderboardDisplay from "./LeaderboardDisplay";

interface LeaderboardsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: { username: string; id: string; } | null;
}

export default function LeaderboardsDialog({ isOpen, onClose, userProfile }: LeaderboardsDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-3xl text-primary text-center">Legends of the Realm</DialogTitle>
                    <DialogDescription className="text-lg text-foreground/80 pt-2 text-center">
                        The histories of rulers, past and present.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                    {leaderboards.map(lb => (
                        <LeaderboardDisplay
                            key={lb.id}
                            leaderboardId={lb.id}
                            title={lb.name}
                            icon={lb.icon}
                            userProfile={userProfile}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
