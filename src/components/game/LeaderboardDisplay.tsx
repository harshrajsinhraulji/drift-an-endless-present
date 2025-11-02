
'use client';
import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { LeaderboardEntry as LeaderboardEntryType } from '@/lib/leaderboard-data';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LeaderboardDisplayProps {
    leaderboardId: string;
    title: string;
    icon: React.ElementType;
    userProfile: { username: string; id: string } | null;
}

const LeaderboardEntry = ({ rank, username, score, isCurrentUser }: { rank: number; username: string; score: number, isCurrentUser: boolean }) => {
    return (
        <div className={cn("flex items-center justify-between text-base", isCurrentUser && "text-primary font-bold")}>
            <div className="flex items-center gap-3">
                <span className={cn("w-6 text-center text-lg", rank <= 3 && "font-bold")}>{rank}</span>
                <span className="truncate">{username}</span>
            </div>
            <span className="font-bold">{score}</span>
        </div>
    );
};

export default function LeaderboardDisplay({ leaderboardId, title, icon: Icon, userProfile }: LeaderboardDisplayProps) {
    const firestore = useFirestore();

    const leaderboardQuery = useMemo(() => {
        if (!firestore) return null;
        // Corrected & Hardened: This query now ONLY fetches the top 3 entries.
        // It no longer attempts to fetch all documents to calculate a user's rank on the client.
        // Calculating user rank should be done with a server-side function for efficiency.
        return query(
            collection(firestore, 'leaderboards', leaderboardId, 'entries'),
            orderBy('score', 'desc'),
            limit(3)
        );
    }, [firestore, leaderboardId]);

    const { data: topEntries, isLoading } = useCollection<LeaderboardEntryType>(leaderboardQuery);

    return (
        <div className="space-y-3">
            <h4 className="font-headline text-primary text-lg flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {title}
            </h4>
            {isLoading ? (
                <div className="flex justify-center items-center h-24">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
                </div>
            ) : topEntries && topEntries.length > 0 ? (
                <div className="space-y-2">
                    {topEntries.map((entry, index) => (
                        <LeaderboardEntry 
                            key={entry.id}
                            rank={index + 1}
                            username={entry.username}
                            score={entry.score}
                            isCurrentUser={entry.userId === userProfile?.id}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground pt-2">The scrolls are empty. No legends have been written... yet.</p>
            )}
        </div>
    );
}
