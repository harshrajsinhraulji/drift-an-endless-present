
'use client';
import { useMemo } from 'react';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import type { LeaderboardEntry as LeaderboardEntryType } from '@/lib/leaderboard-data';
import { cn } from '@/lib/utils';
import { Loader2, Minus, UserCircle } from 'lucide-react';
import { Separator } from '../ui/separator';

interface LeaderboardDisplayProps {
    leaderboardId: string;
    title: string;
    icon: React.ElementType;
    userProfile: { username: string; id: string } | null;
}

const LeaderboardEntry = ({ rank, username, score, isCurrentUser, isCompact = false }: { rank: number | string; username: string; score: number, isCurrentUser: boolean, isCompact?: boolean }) => {
    return (
        <div className={cn(
            "flex items-center justify-between",
            isCurrentUser && "text-primary font-bold",
            isCompact ? "text-sm" : "text-base"
        )}>
            <div className="flex items-center gap-3">
                <span className={cn(
                    "w-6 text-center", 
                    rank <= 3 && "font-bold",
                    isCompact ? "text-sm" : "text-lg",
                )}>
                    {rank}
                </span>
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
        return query(
            collection(firestore, 'leaderboards', leaderboardId, 'entries'),
            orderBy('score', 'desc'),
            limit(3)
        );
    }, [firestore, leaderboardId]);

    const userEntryRef = useMemo(() => {
        if (!firestore || !userProfile) return null;
        return doc(firestore, 'leaderboards', leaderboardId, 'entries', userProfile.id);
    }, [firestore, leaderboardId, userProfile]);

    const { data: topEntries, isLoading: isLoadingTop } = useCollection<LeaderboardEntryType>(leaderboardQuery);
    const { data: userEntry, isLoading: isLoadingUser } = useDoc<LeaderboardEntryType>(userEntryRef);

    const isLoading = isLoadingTop || isLoadingUser;

    const userIsInTop = topEntries?.some(entry => entry.userId === userProfile?.id);

    return (
        <div className="space-y-4">
            <h4 className="font-headline text-primary text-xl flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {title}
            </h4>
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
                </div>
            ) : topEntries && topEntries.length > 0 ? (
                <div className="space-y-3">
                    {topEntries.map((entry, index) => (
                        <LeaderboardEntry 
                            key={entry.id}
                            rank={index + 1}
                            username={entry.username}
                            score={entry.score}
                            isCurrentUser={entry.userId === userProfile?.id}
                        />
                    ))}
                    {!userIsInTop && userEntry && (
                       <>
                        <Separator className="my-3" />
                         <LeaderboardEntry
                            rank={"-"} // We don't know the exact rank, just show their score
                            username={userEntry.username}
                            score={userEntry.score}
                            isCurrentUser={true}
                            isCompact={true}
                        />
                       </>
                    )}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground pt-2">The scrolls are empty. No legends have been written... yet.</p>
            )}
        </div>
    );
}
