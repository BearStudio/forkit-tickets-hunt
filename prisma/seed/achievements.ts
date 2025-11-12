import { inAppAchievements } from '@/features/achievement/in-app-achievements';
import { db } from '@/server/db';

export async function createAchievements() {
  console.log(`⏳ Seeding in app achievements`);

  await Promise.all(
    inAppAchievements.map(
      async (achievement) =>
        await db.achievement.upsert({
          where: { key: achievement.key },
          update: achievement,
          create: achievement,
        })
    )
  );

  console.log(`✅ In app achievements are up to date`);
}
