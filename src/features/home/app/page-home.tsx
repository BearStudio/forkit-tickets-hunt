import { Logo } from '@/components/brand/logo';

import { AchievementsList } from '@/features/achievement/app/achievements-list';
import { CurrentUserRank } from '@/features/user/app/current-user-rank';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageHome = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar className="md:hidden">
        <Logo className="mx-auto w-24" />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-1 flex-col gap-4">
          <div className="mb-4 rounded-lg bg-muted p-4 text-center">
            <h2 className="mb-2 text-lg font-semibold">
              Welcome to the Achievement App!
            </h2>
            <p className="text-sm text-muted-foreground">
              Unlock achievements by completing activities and reaching
              milestones across the app. Each achievement is worth a certain
              number of points. The more achievements you complete, the more
              points you earn! Discover hidden challenges, track your progress,
              and compete to reach the top.
            </p>
            <div className="mt-3 text-sm font-medium text-primary">
              Complete achievements to earn points and showcase your
              accomplishments!
            </div>
          </div>
          <CurrentUserRank />
          <AchievementsList />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
