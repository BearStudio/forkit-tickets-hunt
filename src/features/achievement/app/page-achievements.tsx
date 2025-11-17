import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import LightRays from '@/components/light-rays';
import { PageError } from '@/components/page-error';
import { Skeleton } from '@/components/ui/skeleton';

import { AchievementItem } from '@/features/achievement/app/achievement-item';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAchievements = () => {
  const { t } = useTranslation(['achievement']);
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
          raysColor="#ebff11"
          raysSpeed={0.2}
          lightSpread={0.8}
          rayLength={10}
          fadeDistance={10}
          followMouse={true}
          mouseInfluence={0.05}
          noiseAmount={0.15}
          distortion={0.05}
        />
      </div>
      <PageLayoutTopBar className="md:hidden">
        <h1 className="text-base font-medium md:text-sm">
          {t('achievement:common.achievements')}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="grid gap-3 pb-20 sm:grid-cols-2 md:grid-cols-3">
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
