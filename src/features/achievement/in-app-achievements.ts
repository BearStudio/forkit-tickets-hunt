import { Achievement, AchievementType } from '@/features/achievement/schema';

export const inAppAchievements = [
  // GitHub
  {
    key: 'BearStudio/start-ui-web',
    name: 'Start UI web ⭐',
    hint: 'Star BearStudio/start-ui-web on Github',
    emoji: '⭐',
    points: 100,
    isSecret: false,
    type: 'GITHUB_STAR' as const,
  } as const,
  {
    key: 'BearStudio/start-ui-native',
    name: 'Start UI native ⭐',
    hint: 'Star BearStudio/start-ui-native on Github',
    emoji: '⭐',
    points: 100,
    isSecret: false,
    type: 'GITHUB_STAR' as const,
  } as const,
  {
    key: 'Fork-It-Community/forkit.community',
    name: 'forkit.community ⭐',
    hint: 'Star Fork-It-Community/forkit.community on Github',
    emoji: '⭐',
    points: 100,
    isSecret: false,
    type: 'GITHUB_STAR' as const,
  } as const,
  {
    key: 'DecampsRenan/kikoojs',
    name: 'kikoojs ⭐',
    hint: 'Be kikoo ⭐',
    emoji: '⭐',
    points: 50,
    isSecret: true,
    type: 'GITHUB_STAR' as const,
  } as const,
  // In App
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
