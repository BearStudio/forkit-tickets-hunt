import { ORPCError } from '@orpc/client';
import { useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { TrophyIcon } from 'lucide-react';
import { useEffect } from 'react';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/page-error';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageAchievementComplete = () => {
  const params = useParams({ from: '/app/achievements/$id/complete/' });

  const completeMutation = useMutation(
    orpc.achievement.completeById.mutationOptions()
  );

  useEffect(() => {
    completeMutation.mutate({ id: params.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const isNotFound =
    completeMutation.status === 'error' &&
    completeMutation.error instanceof ORPCError &&
    completeMutation.error.code === 'NOT_FOUND';

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>
          {completeMutation.status === 'pending' && (
            <Skeleton className="h-4 w-48" />
          )}
          {completeMutation.status !== 'pending' &&
            (isNotFound ? 'Achievement not found' : 'Achievement completed')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {completeMutation.status === 'pending' && <Spinner full />}
        {isNotFound && <PageError error="404" />}
        {completeMutation.status === 'success' && (
          <div className="mx-auto w-full max-w-md">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <div
                  aria-hidden
                  className="bg-emerald-600/10 text-emerald-600 flex size-16 items-center justify-center rounded-full"
                >
                  {!!completeMutation.data.achievement.imageUrl && (
                    <img
                      src={completeMutation.data.achievement.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  {!completeMutation.data.achievement.imageUrl &&
                    !!completeMutation.data.achievement.emoji && (
                      <span className="text-3xl">
                        {completeMutation.data.achievement.emoji}
                      </span>
                    )}
                  {!completeMutation.data.achievement.imageUrl &&
                    !completeMutation.data.achievement.emoji && (
                      <TrophyIcon className="size-8" />
                    )}
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold">
                    {completeMutation.data.alreadyCompleted
                      ? 'Already completed'
                      : 'Achievement completed!'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {completeMutation.data.achievement.name} •{' '}
                    {completeMutation.data.achievement.points} pts
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {completeMutation.status === 'error' && !isNotFound && <PageError />}
      </PageLayoutContent>
    </PageLayout>
  );
};
