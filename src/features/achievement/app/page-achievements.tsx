import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import LightRays from '@/components/light-rays';
import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';
import { Skeleton } from '@/components/ui/skeleton';

import { AchievementItem } from '@/features/achievement/app/achievement-item';
import { SecretCodeInput } from '@/features/secret-code/secret-code-input';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAchievements = () => {
  const { t } = useTranslation(['achievement', 'secretCode']);
  const achievementsQuery = useQuery(
    orpc.achievement.getAllWithCompletion.queryOptions()
  );

  const ui = getUiState((set) => {
    if (achievementsQuery.status === 'pending') return set('pending');
    if (achievementsQuery.status === 'error') return set('error');
    const data = achievementsQuery.data;

    if (!data.total) return set('empty');

    return set('default', data);
  });

  return (
    <PageLayout>
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
        <LightRays
          raysOrigin="top-center"
          raysColor="#F3FF6D"
          raysSpeed={0.2}
          lightSpread={0.8}
          rayLength={10}
          fadeDistance={10}
          followMouse={true}
          mouseInfluence={0.05}
          noiseAmount={0.15}
          distortion={0.05}
          saturation={5}
        />
      </div>
      <PageLayoutTopBar
        className="md:hidden"
        rightActions={
          <ResponsiveDrawer>
            <ResponsiveDrawerTrigger asChild>
              <Button variant="secondary">
                {t('home:actions.secretCode')}
              </Button>
            </ResponsiveDrawerTrigger>
            <ResponsiveDrawerContent>
              <ResponsiveDrawerHeader>
                <ResponsiveDrawerTitle>
                  {t('secretCode:drawer.title')}
                </ResponsiveDrawerTitle>
              </ResponsiveDrawerHeader>
              <ResponsiveDrawerBody>
                <SecretCodeInput />
              </ResponsiveDrawerBody>
            </ResponsiveDrawerContent>
          </ResponsiveDrawer>
        }
      >
        <h1 className="text-base font-medium md:text-sm">
          {t('achievement:common.achievements')}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent containerClassName="gap-4">
        <div className="grid items-start gap-3 pb-20 sm:grid-cols-2 md:grid-cols-3">
          {ui
            .match('pending', () => (
              <>
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </>
            ))
            .match('error', () => <PageError />)
            .match('empty', () => <p>No achievements found</p>)
            .match('default', ({ dones, toComplete }) => (
              <>
                {toComplete.map((item) => (
                  <AchievementItem key={item.id} achievement={item} />
                ))}
                {dones.map((item) => (
                  <AchievementItem key={item.id} achievement={item} completed />
                ))}
              </>
            ))
            .exhaustive()}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
