import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/brand/logo';

import { AchievementsList } from '@/features/achievement/app/achievements-list';
import { CurrentUserRank } from '@/features/user/app/current-user-rank';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageHome = () => {
  const { t } = useTranslation(['home']);
  return (
    <PageLayout>
      <PageLayoutTopBar className="md:hidden">
        <Logo className="mx-auto w-24" />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-1 flex-col gap-4">
          <div className="mb-4 rounded-lg bg-muted p-4 text-center">
            <h2 className="mb-2 text-lg font-semibold">
              {t('home:welcome.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('home:welcome.description')}
            </p>
            <div className="mt-3 text-sm font-medium text-primary">
              {t('home:welcome.cta')}
            </div>
          </div>
          <CurrentUserRank />
          <AchievementsList />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
