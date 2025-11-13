import { Achievement, AchievementType } from '@/features/achievement/schema';
import { GITHUB_REPOSITORIES_TO_CHECK } from '@/features/github/constants';

const GITHUB_REPOSITORIES_TO_CHECK_ACHIEVEMENTS =
  GITHUB_REPOSITORIES_TO_CHECK.map((repositoryKey) => ({
    key: repositoryKey,
    secretId: repositoryKey,
    name: `Github Star • ${repositoryKey}`,
    hint: 'Star the repository on Github',
    emoji: '⭐',
    points: 100,
    isSecret: false,
    type: 'GITHUB_STAR' as const,
  })) satisfies Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>[];

export const inAppAchievements = [
  ...GITHUB_REPOSITORIES_TO_CHECK_ACHIEVEMENTS,
  {
    key: 'onboarded',
    secretId: 'cmhvykzoq0001c9pcmbgipx4a',
    name: 'Onboarded',
    hint: 'Check your email',
    emoji: '👋',
    points: 50,
    isSecret: false,
    type: 'IN_APP' as const,
  } as const,
  {
    key: 'error',
    secretId: 'cmhvykzp30003c9pcq7tju1pc',
    name: 'Erreur',
    hint: 'Une erreur est survenue...',
    emoji: '⚠️',
    points: 100,
    isSecret: true,
    type: 'IN_APP' as const,
  } as const,
] satisfies (Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'> & {
  secretId?: string;
  type: AchievementType;
})[];
