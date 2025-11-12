import { Achievement } from '@/features/achievement/schema';

export const inAppAchievements = [
  {
    key: 'onboarded',
    secretId: 'cmhvykzoq0001c9pcmbgipx4a',
    name: 'Onboarded',
    hint: 'Check your email',
    emoji: '👋',
    points: 50,
    isSecret: false,
  } as const,
  {
    key: 'error',
    secretId: 'cmhvykzp30003c9pcq7tju1pc',
    name: 'Erreur',
    hint: 'Une erreur est survenue...',
    emoji: '⚠️',
    points: 100,
    isSecret: true,
  } as const,
] satisfies (Omit<
  Achievement & { secretId: string },
  'id' | 'createdAt' | 'updatedAt'
> & { secretId: string })[];
