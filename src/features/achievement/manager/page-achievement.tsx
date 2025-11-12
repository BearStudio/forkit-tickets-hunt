import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useCanGoBack, useRouter } from '@tanstack/react-router';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CopyIcon,
  PencilLineIcon,
  Trash2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/page-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { envClient } from '@/env/client';
import { WithPermissions } from '@/features/auth/with-permission';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageAchievement = (props: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const achievementQuery = useQuery(
    orpc.achievement.getById.queryOptions({ input: { id: props.params.id } })
  );
  const { t } = useTranslation(['achievement']);

  const achievementUrl = achievementQuery.data
    ? `${envClient.VITE_BASE_URL}/app/achievements/${achievementQuery.data.secretId}/complete`
    : '';

  const [, copyToClipboard] = useCopyToClipboard();
  const [showFeedback, setShowFeedback] = useState(false);

  const copyAchievementUrl = () => {
    setShowFeedback(true);
    copyToClipboard(achievementUrl);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [showFeedback]);

  const ui = getUiState((set) => {
    if (achievementQuery.status === 'pending') return set('pending');
    if (
      achievementQuery.status === 'error' &&
      achievementQuery.error instanceof ORPCError &&
      achievementQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (achievementQuery.status === 'error') return set('error');
    return set('default', { achievement: achievementQuery.data });
  });

  const deleteAchievement = async () => {
    try {
      await orpc.achievement.deleteById.call({ id: props.params.id });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orpc.achievement.getAll.key(),
          type: 'all',
        }),
        queryClient.removeQueries({
          queryKey: orpc.achievement.getById.key({
            input: { id: props.params.id },
          }),
        }),
      ]);

      toast.success(t('achievement:manager.detail.deleted'));

      if (canGoBack) {
        router.history.back();
      } else {
        router.navigate({ to: '..', replace: true });
      }
    } catch {
      toast.error(t('achievement:manager.detail.deleteError'));
    }
  };

  return (
    <PageLayout>
      <PageLayoutTopBar
        backButton={<BackButton />}
        actions={
          <>
            <WithPermissions
              permissions={[
                {
                  achievement: ['delete'],
                },
              ]}
            >
              <ConfirmResponsiveDrawer
                onConfirm={() => deleteAchievement()}
                title={t('achievement:manager.detail.deleteConfirmTitle', {
                  name: achievementQuery.data?.name ?? '--',
                })}
                description={t(
                  'achievement:manager.detail.deleteConfirmDescription'
                )}
                confirmText={t('achievement:manager.detail.deleteButton.label')}
                confirmVariant="destructive"
              >
                <ResponsiveIconButton
                  variant="ghost"
                  label={t('achievement:manager.detail.deleteButton.label')}
                  size="sm"
                >
                  <Trash2Icon />
                </ResponsiveIconButton>
              </ConfirmResponsiveDrawer>
            </WithPermissions>
            <Button asChild size="sm" variant="secondary">
              <Link
                to="/manager/achievements/$id/update"
                params={{ id: props.params.id }}
              >
                <PencilLineIcon />
                {t('achievement:manager.detail.editButton.label')}
              </Link>
            </Button>
          </>
        }
      >
        <PageLayoutTopBarTitle>
          {ui
            .match('pending', () => <Skeleton className="h-4 w-48" />)
            .match(['not-found', 'error'], () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .match('default', ({ achievement }) => <>{achievement.name}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <PageError error="404" />)
          .match('error', () => <PageError />)
          .match('default', ({ achievement }) => (
            <div className="flex flex-col gap-4 xs:flex-row">
              <div className="flex-2">
                <Card className="py-1">
                  <CardContent>
                    <dl className="flex flex-col divide-y text-sm">
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('achievement:common.name.label')}
                        </dt>
                        <dd className="flex-1">{achievement.name}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('achievement:common.hint.label')}
                        </dt>
                        <dd className="flex-1">{achievement.hint}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('achievement:common.points.label')}
                        </dt>
                        <dd className="flex-1">{achievement.points}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('achievement:common.secret.label')}
                        </dt>
                        <dd className="flex-1">
                          {achievement.isSecret
                            ? t('achievement:common.yes')
                            : t('achievement:common.no')}
                        </dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('achievement:common.emoji.label')}
                        </dt>
                        <dd className="flex-1">{achievement.emoji}</dd>
                      </div>
                      <div className="flex gap-4 py-3">
                        <dt className="w-24 flex-none font-medium text-muted-foreground">
                          {t('achievement:common.imageUrl.label')}
                        </dt>
                        <dd className="flex-1">{achievement.imageUrl}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
              <div
                aria-hidden
                className="mx-auto flex w-full max-w-64 min-w-48 flex-1 flex-col items-center justify-center gap-4 rounded-md bg-muted"
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    achievementUrl
                  )}`}
                  alt=""
                  className="h-40 w-40 rounded bg-white p-2"
                />
                {showFeedback ? (
                  <span className="flex items-center gap-1 rounded-md bg-positive-100 px-1.5 py-1 text-xs font-medium text-positive-800 max-sm:mx-auto dark:bg-positive-600/30 dark:text-positive-100">
                    <CheckCircle2Icon className="size-3" />{' '}
                    {t('achievement:manager.detail.copiedToClipboard')}
                  </span>
                ) : (
                  <Button
                    size="xs"
                    variant="secondary"
                    className="max-sm:mx-auto"
                    onClick={() => copyAchievementUrl()}
                  >
                    <CopyIcon />
                    {t('achievement:manager.detail.copyToClipboard')}
                  </Button>
                )}
              </div>
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
