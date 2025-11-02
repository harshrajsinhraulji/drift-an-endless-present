
import { Crown, Swords, Users, Leaf, CircleDollarSign } from 'lucide-react';
import type { User } from 'firebase/auth';

export interface Leaderboard {
    id: 'dynasty' | 'army' | 'approval';
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
        name: 'Longest Dynasty',
        icon: Crown,
    },
    {
        id: 'army',
        name: 'Largest Army',
        icon: Swords,
    },
    {
        id: 'approval',
        name: 'Highest Approval',
        icon: Users,
    }
];

// Function to create a new leaderboard entry (for seeding/testing if needed)
export const createLeaderboardEntry = (user: User, leaderboardId: string, score: number, username: string): Omit<LeaderboardEntry, 'id' | 'timestamp'> => {
    return {
        leaderboardId,
        userId: user.uid,
        username: username,
        score,
    };
};

    