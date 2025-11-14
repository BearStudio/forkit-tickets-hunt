import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { TrophyIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TicketIcon } from '@/components/ui/ticket-icon';

import { PageLayout, PageLayoutContent } from '@/layout/app/page-layout';

export const PageAchievementComplete = () => {
  const params = useParams({ from: '/app/achievements/$id/complete/' });

  const completionQuery = useQuery(
    orpc.achievement.completeBySecretId.queryOptions({
      input: { id: params.id },
    })
  );

  const ui = getUiState((set) => {
    if (completionQuery.status === 'pending') return set('pending');

    if (
      completionQuery.status === 'error' &&
      completionQuery.error instanceof ORPCError &&
      completionQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');

    if (
      completionQuery.status === 'error' &&
      completionQuery.error instanceof ORPCError &&
      completionQuery.error.code === 'FORBIDDEN'
    )
      return set('not-starred');

    if (completionQuery.status !== 'success') return set('error');

    if (completionQuery.data.alreadyCompleted)
      return set('already-completed', { data: completionQuery.data });

    return set('default', { data: completionQuery.data });
  });

  return (
    <PageLayout>
      <PageLayoutContent>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
          {ui
            .match('pending', () => <Spinner full />)
            .match('error', () => <PageError />)
            .match(['not-found', 'not-starred'], () => 'Nice try!')
            .match(['already-completed'], () => 'Already completed')
            .match(['default'], ({ data }) => (
              <>
                <div className="flex aspect-square size-24 items-center justify-center overflow-hidden rounded-full border-1 border-white/10 bg-white/5 shadow-2xl shadow-white/10">
                  <div>
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
                </div>
                <div className="flex flex-col gap-1 text-center">
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
                <Button variant="secondary" asChild>
                  <Link to="/app">Close</Link>
                </Button>
              </>
            ))
            .exhaustive()}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
