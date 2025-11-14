import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { CheckIcon, ExternalLinkIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';
import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { TicketIcon } from '@/components/ui/ticket-icon';

import { getAchievementLinkBySecretId } from '@/features/achievement/get-achievement-link';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';
import { Link } from '@tanstack/react-router';

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
      <PageLayoutTopBar className="md:hidden">
        <h1 className="text-base font-medium md:text-sm">
          {t('achievement:common.achievements')}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {ui
            .match('pending', () => 'loading')
            .match('error', () => 'error')
            .match('empty', () => 'none')
            .match('default', ({ dones, toComplete }) => (
              <>
                {toComplete.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex flex-col overflow-hidden rounded-lg border border-white/4 bg-muted text-foreground shadow-2xl'
                    )}
                  >
                    <div className="relative flex items-center gap-3 p-2">
                      <div
                        className={cn(
                          'flex aspect-square size-12 items-center justify-center overflow-hidden rounded-md border border-foreground/10 bg-background text-foreground'
                        )}
                      >
                        <div className="opacity-40 grayscale">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          )}
                          {!item.imageUrl && item.emoji && (
                            <span className="text-lg">{item.emoji}</span>
                          )}
                          {!item.imageUrl && !item.emoji && (
                            <TrophyIcon className="size-6 text-accent" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-1 text-sm leading-tight">
                        <p className="font-bold">{item.name}</p>
                      </div>
                      <div className="flex items-center justify-center px-2">
                        <span className="flex flex-col items-center text-xs opacity-60">
                          +{item.points || '???'}
                          <TicketIcon className="w-8 opacity-60 grayscale" />
                        </span>
                      </div>
                    </div>
                    {!item.secretId &&
                      (!!item.hint || item.type === 'GITHUB_STAR') && (
                        <div className="flex flex-1 items-center gap-3 border-t bg-white/2 px-3 py-2">
                          <p className="flex-1 text-xs opacity-60">
                            {item.hint}
                          </p>
                          {item.type === 'GITHUB_STAR' && !!item.key && (
                            <Button size="xs" variant="ghost" asChild>
                              <a href={`https://github.com/${item.key}`}>
                                {t('achievement:app.githubStar.viewRepo')}
                                <ExternalLinkIcon />
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    {item.type === 'GITHUB_STAR' && item.secretId && (
                      <div className="flex flex-1 flex-col items-center gap-1 border-t bg-white/2 px-3 py-2">
                        <p className="flex-1 text-2xs opacity-60">
                          {t('achievement:app.githubStar.youStarred')}
                        </p>
                        <Button
                          size="lg"
                          variant="secondary"
                          className="w-full"
                          asChild
                        >
                          <Link
                            to={getAchievementLinkBySecretId(item.secretId)}
                          >
                            {t('achievement:app.githubStar.claim', {
                              points: item.points,
                            })}{' '}
                            <TicketIcon />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {dones.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex flex-col overflow-hidden rounded-lg border border-white/4 bg-muted text-foreground shadow-2xl'
                    )}
                  >
                    <div className="relative flex items-center gap-3 p-2">
                      <div className="absolute top-1.5 left-1.5 flex size-4 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <CheckIcon className="size-3" />
                      </div>
                      <div
                        className={cn(
                          'flex aspect-square size-12 items-center justify-center overflow-hidden rounded-md border border-foreground/10 bg-background text-foreground'
                        )}
                      >
                        <div>
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          )}
                          {!item.imageUrl && item.emoji && (
                            <span className="text-lg">{item.emoji}</span>
                          )}
                          {!item.imageUrl && !item.emoji && (
                            <TrophyIcon className="size-6 text-accent" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-1 text-sm leading-tight">
                        <p className="font-bold">{item.name}</p>
                      </div>
                      <div className="flex items-center justify-center px-2">
                        <span className="flex flex-col items-center text-xs">
                          +{item.points || '???'}
                          <TicketIcon className="w-8" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ))
            .exhaustive()}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
