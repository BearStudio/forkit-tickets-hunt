import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { TrophyIcon } from 'lucide-react';
import { useEffect } from 'react';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/page-error';
import PrismaticBurst from '@/components/prismatic-burst';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { TicketIcon } from '@/components/ui/ticket-icon';

import { fireworks } from '@/features/achievement/app/fireworks';
import { PageLayout, PageLayoutContent } from '@/layout/app/page-layout';

export const PageAchievementComplete = (props: { secretId: string }) => {
  const router = useRouter();

  const completionQuery = useQuery(
    orpc.achievement.completeBySecretId.queryOptions({
      input: { id: props.secretId },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })
  );

  const ui = getUiState((set) => {
    if (completionQuery.status === 'pending') return set('pending');

    if (
      completionQuery.status === 'error' &&
      completionQuery.error instanceof ORPCError &&
      (completionQuery.error.code === 'NOT_FOUND' ||
        completionQuery.error.code === 'FORBIDDEN')
    )
      return set('not-found');

    if (completionQuery.status !== 'success') return set('error');

    if (completionQuery.data.alreadyCompleted)
      return set('already-completed', { data: completionQuery.data });

    return set('default', { data: completionQuery.data });
  });

  const triggerFireworks = ui.is('default');

  useEffect(() => {
    if (triggerFireworks) {
      fireworks();
    }
  }, [triggerFireworks]);

  return (
    <PageLayout>
      <PageLayoutContent>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
          {ui
            .match('pending', () => (
              <div className="relative flex flex-col items-center justify-center gap-6 p-6">
                <div className="flex aspect-square size-24 items-center justify-center overflow-hidden rounded-full border-1 border-white/10 bg-white/5 shadow-2xl shadow-white/10">
                  <Spinner />
                </div>
                <div className="flex flex-col items-center justify-center gap-1 text-center">
                  <h1 className="text-xs font-medium uppercase opacity-60">
                    Achievement unlocked
                  </h1>
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            ))
            .match('error', () => <PageError />)
            .match(['not-found'], () => (
              <div className="relative flex flex-col items-center justify-center gap-6 p-6">
                <div className="flex aspect-square size-24 items-center justify-center overflow-hidden rounded-full border-1 border-white/10 bg-white/5 shadow-2xl shadow-white/10 backdrop-blur-lg">
                  <Spinner />
                </div>
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <h1 className="text-xs font-medium uppercase opacity-60">
                    Achievement
                  </h1>
                  <h2 className="text-xl font-bold text-balance">Not found</h2>
                </div>
              </div>
            ))
            .match(['already-completed'], ({ data }) => (
              <div className="relative flex flex-col items-center justify-center gap-6 p-6">
                <div className="flex aspect-square size-24 items-center justify-center overflow-hidden rounded-full border-1 border-white/10 bg-white/5 shadow-2xl shadow-white/10 backdrop-blur-lg">
                  {data.achievement.imageUrl && (
                    <img
                      src={data.achievement.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                  {!data.achievement.imageUrl && data.achievement.emoji && (
                    <span className="text-5xl">{data.achievement.emoji}</span>
                  )}
                  {!data.achievement.imageUrl && !data.achievement.emoji && (
                    <TrophyIcon className="size-8 text-accent" />
                  )}
                </div>
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <h1 className="text-xs font-medium uppercase opacity-60">
                    Achievement
                  </h1>
                  <h2 className="text-xl font-bold text-balance">
                    Already completed!
                  </h2>
                </div>
              </div>
            ))
            .match(['default'], ({ data }) => (
              <>
                <div className="fixed inset-0">
                  <PrismaticBurst
                    animationType="rotate3d"
                    intensity={1.9}
                    speed={1.2}
                    rayCount={7}
                    colors={['#ebff11', '#15A495', '#000']}
                  />
                </div>
                <div className="relative flex w-full flex-col items-center justify-center gap-6">
                  <div
                    className="flex aspect-square size-24 items-center justify-center overflow-hidden rounded-full border-1 border-white/10 bg-white/5 shadow-2xl shadow-white/10 backdrop-blur-lg"
                    onClick={() => {
                      fireworks();
                    }}
                  >
                    {data.achievement.imageUrl && (
                      <img
                        src={data.achievement.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    )}
                    {!data.achievement.imageUrl && data.achievement.emoji && (
                      <span className="text-5xl">{data.achievement.emoji}</span>
                    )}
                    {!data.achievement.imageUrl && !data.achievement.emoji && (
                      <TrophyIcon className="size-8 text-accent" />
                    )}
                  </div>
                  <div className="relative flex flex-col items-center justify-center gap-1 text-center">
                    <h1 className="text-xs font-medium uppercase opacity-60">
                      Achievement unlocked
                    </h1>
                    <h2 className="text-xl font-bold text-balance">
                      {data.achievement.name}
                    </h2>
                  </div>
                  <p className="flex gap-4 text-3xl font-bold">
                    +{data.achievement.points} <TicketIcon className="w-12" />
                  </p>
                </div>
              </>
            ))
            .exhaustive()}
          <Button variant="secondary" asChild>
            <Link
              to="/app"
              onClick={(e) => {
                if (router.history.canGoBack()) {
                  e.preventDefault();
                  router.history.back();
                }
              }}
            >
              Close
            </Link>
          </Button>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
