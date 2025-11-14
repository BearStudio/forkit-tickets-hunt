import { envClient } from '@/env/client';
import { inAppAchievements } from '@/features/achievement/in-app-achievements';

const getAchievementLinkRaw = (pathParam: string) => {
  return `${envClient.VITE_BASE_URL}/app/achievements/${pathParam}/complete`;
};

export const getAchievementLinkBySecretId = (secretId: string) => {
  return getAchievementLinkRaw(secretId);
};

export const getAchievementLinkByKey = (key: string) => {
  const achievement = inAppAchievements.find(
    (achievement) => achievement.key === key
  );

  if (!achievement) {
    throw new Error(`Achievement with key ${key} not found`);
  }

  return achievement.secretId
    ? getAchievementLinkBySecretId(achievement.secretId)
    : '';
};
