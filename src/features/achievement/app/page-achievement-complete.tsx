import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { TrophyIcon } from 'lucide-react';
import { useEffect } from 'react';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/page-error';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { PageLayout, PageLayoutContent } from '@/layout/app/page-layout';

export const PageAchievementComplete = () => {
  const params = useParams({ from: '/app/achievements/$id/complete/' });

  const completeMutation = useMutation(
    orpc.achievement.completeBySecretId.mutationOptions()
  );

  useEffect(() => {
    completeMutation.mutate({ id: params.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const ui = getUiState((set) => {
    if (completeMutation.status === 'pending') return set('pending');

    if (
      completeMutation.status === 'error' &&
      completeMutation.error instanceof ORPCError &&
      completeMutation.error.code === 'NOT_FOUND'
    )
      return set('not-found');

    if (completeMutation.status !== 'success') return set('error');

    if (completeMutation.data.alreadyCompleted)
      return set('already-completed', { data: completeMutation.data });
    return set('default', { data: completeMutation.data });
  });

  return (
    <PageLayout>
      <PageLayoutContent>
        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>
                {ui
                  .match('pending', () => <Skeleton className="h-4 w-48" />)
                  .match('error', () => 'Error')
                  .match('not-found', () => 'Not existing achievement')
                  .match(
                    ['default', 'already-completed'],
                    ({ data }) => `${data.achievement.name} reached!`
                  )
                  .exhaustive()}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              {ui
                .match('pending', () => <Spinner full />)
                .match('error', () => <PageError />)
                .match('not-found', () => 'Nice try!')
                .match(['default', 'already-completed'], ({ data }) => (
                  <>
                    <div
                      aria-hidden
                      className="bg-emerald-600/10 text-emerald-600 flex size-16 items-center justify-center rounded-full"
                    >
                      {!!data.achievement.imageUrl && (
                        <img
                          src={data.achievement.imageUrl}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      {!data.achievement.imageUrl &&
                        !!data.achievement.emoji && (
                          <span className="text-3xl">
                            {data.achievement.emoji}
                          </span>
                        )}
                      {!data.achievement.imageUrl &&
                        !data.achievement.emoji && (
                          <TrophyIcon className="size-8" />
                        )}
                    </div>
                    <p className="text-xl text-accent-foreground">
                      {data.alreadyCompleted
                        ? 'But you already completed it!'
                        : `You win ${data.achievement.points} points! 🎉`}
                    </p>
                  </>
                ))
                .exhaustive()}
            </CardContent>
          </Card>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
