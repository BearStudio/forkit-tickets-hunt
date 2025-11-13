import { useTranslation } from 'react-i18next';

import { AchievementsList } from '@/features/achievement/app/achievements-list';
import { GithubClaim } from '@/features/home/app/github-claim';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAchievements = () => {
  const { t } = useTranslation(['achievement']);
  return (
    <PageLayout>
      <PageLayoutTopBar className="md:hidden">
        <h1 className="text-base font-medium md:text-sm">
          {t('achievement:common.achievements')}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-8">
          <GithubClaim />
          <AchievementsList />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
