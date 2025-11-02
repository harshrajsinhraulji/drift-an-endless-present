
import { Leaf, Users, Shield, CircleDollarSign, Star, TrendingUp, TrendingDown, Crown, Milestone, Bot, Zap, Biohazard } from 'lucide-react';
import type { StoryFlag } from './game-data';

export type AchievementId = 
  | 'quarter_centenarian'
  | 'half_centenarian'
  | 'centenarian'
  | 'golden_age'
  | 'cosmic_merger'
  | 'environment_low'
  | 'environment_high'
  | 'people_low'
  | 'people_high'
  | 'army_low'
  | 'army_high'
  | 'money_low'
  | 'money_high'
  | 'creator_mercy'
  | 'gift_of_foresight'
  | 'plague_survivor';

export interface Achievement {
    id: AchievementId;
    name: string;
    description: string;
    icon: React.ElementType;
}

export interface UserAchievement {
    id: string; // doc id from firestore
    achievementId: AchievementId;
    userId: string;
    timestamp: any;
}

export const allAchievements: Achievement[] = [
    // Year Milestones
    {
        id: 'quarter_centenarian',
        name: 'Quarter Centenarian',
        description: 'You have successfully ruled for 25 years.',
        icon: Milestone,
    },
    {
        id: 'half_centenarian',
        name: 'Half Centenarian',
        description: 'You have successfully ruled for 50 years.',
        icon: Milestone,
    },
    {
        id: 'centenarian',
        name: 'The Centenarian',
        description: 'You have successfully ruled for 100 years. A true legend.',
        icon: Crown,
    },
    // Special Endings
    {
        id: 'golden_age',
        name: 'Golden Age',
        description: 'Achieve the Golden Age ending by maintaining balance for over 50 years.',
        icon: Star,
    },
    {
        id: 'cosmic_merger',
        name: 'Cosmic Merger',
        description: 'Achieve the Star ending by embracing the cosmic entity.',
        icon: Zap,
    },
    // Failure Endings
    { id: 'environment_low', name: 'Wasteland', description: 'Your kingdom crumbled as the environment withered away.', icon: TrendingDown },
    { id: 'environment_high', name: 'Wilderness', description: 'Your kingdom was consumed by untamed nature.', icon: TrendingUp },
    { id: 'people_low', name: 'Revolution', description: 'Your rule was ended by a popular uprising.', icon: TrendingDown },
    { id: 'people_high', name: 'The Adored', description: 'Your people\'s fanaticism led to the collapse of society.', icon: TrendingUp },
    { id: 'army_low', name: 'Conquered', description: 'Your defenseless kingdom was overrun by invaders.', icon: TrendingDown },
    { id: 'army_high', name: 'Coup d\'État', description: 'Your own army seized power from you.', icon: TrendingUp },
    { id: 'money_low', name: 'Bankrupt', description: 'Your kingdom fell into chaos due to an empty treasury.', icon: TrendingDown },
    { id: 'money_high', name: 'Economic Collapse', description: 'Your kingdom\'s economy collapsed under the weight of its own gold.', icon: TrendingUp },
    // Story Achievements
    {
        id: 'plague_survivor',
        name: 'Plague Survivor',
        description: 'You successfully navigated the great plague.',
        icon: Biohazard,
    },
    {
        id: 'creator_mercy',
        name: 'Second Chance',
        description: 'You accepted the creator\'s mercy to continue your reign.',
        icon: Bot,
    },
    {
        id: 'gift_of_foresight',
        name: 'Gift of Foresight',
        description: 'You accepted the creator\'s gift of prescience.',
        icon: Bot,
    },
]
