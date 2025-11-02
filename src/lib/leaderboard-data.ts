
import { Crown, Swords, Users, Leaf, CircleDollarSign } from 'lucide-react';
import type { User } from 'firebase/auth';

export interface Leaderboard {
    id: 'dynasty';
    name: string;
    icon: React.ElementType;
}

export interface LeaderboardEntry {
    id: string; // doc id
    leaderboardId: string;
    userId: string;
    username: string;
    score: number;
    timestamp: any; // Firestore Timestamp
}

export const leaderboards: Leaderboard[] = [
    {
        id: 'dynasty',
        name: 'Longest Dynasty (Years)',
        icon: Crown,
    }
];
