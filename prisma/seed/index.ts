import { db } from '@/server/db';

import { createAchievements } from './achievements';
import { createUsers } from './user';

async function main() {
  console.log('🚨 Production environment detected, skipping some seeding');
  if (process.env.NODE_ENV !== 'production') {
    await createUsers();
  }
  await createAchievements();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
