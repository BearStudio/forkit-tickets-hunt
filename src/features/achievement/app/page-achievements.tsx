import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CheckIcon, ExternalLinkIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';
import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { TicketIcon } from '@/components/ui/ticket-icon';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAchievements = () => {
  const { t } = useTranslation(['achievement']);
  const achievementsQuery = useInfiniteQuery(
    orpc.achievement.getAllWithCompletion.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const ui = getUiState((set) => {
    if (achievementsQuery.status === 'pending') return set('pending');
    if (achievementsQuery.status === 'error') return set('error');
    const items = achievementsQuery.data?.pages.flatMap((p) => p.items) ?? [];

    if (!items.length) return set('empty');
    return set('default', {
      items,
      total: achievementsQuery.data.pages[0]?.total ?? 0,
    });
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
            .match('default', ({ items }) => (
              <>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex flex-col overflow-hidden rounded-lg border border-white/4 bg-muted text-foreground shadow-2xl'
                    )}
                  >
                    <div className="relative flex items-center gap-3 p-2">
                      {item.completed && (
                        <div className="absolute top-1.5 left-1.5 flex size-4 items-center justify-center rounded-full bg-accent text-accent-foreground">
                          <CheckIcon className="size-3" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'flex aspect-square size-12 items-center justify-center overflow-hidden rounded-md border border-foreground/10 bg-background text-foreground'
                        )}
                      >
                        <div
                          className={cn(
                            !item.completed && 'opacity-40 grayscale'
                          )}
                        >
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
                        <span
                          className={cn(
                            'flex flex-col items-center text-xs',
                            !item.completed && 'opacity-60'
                          )}
                        >
                          +{item.points || '???'}
                          <TicketIcon
                            className={cn(
                              'w-8',
                              !item.completed && 'opacity-60 grayscale'
                            )}
                          />
                        </span>
                      </div>
                    </div>
                    {!item.completed && !!item.hint && (
                      <div className="flex flex-1 items-center gap-3 border-t bg-white/2 px-3 py-2">
                        <p className="flex-1 text-xs opacity-60">{item.hint}</p>
                        <Button size="xs" variant="ghost">
                          View Repo
                          <ExternalLinkIcon />
                        </Button>
                      </div>
                    )}
                    {!item.completed && (
                      <div className="flex flex-1 items-center gap-3 border-t bg-white/2 px-3 py-2">
                        <Button
                          size="lg"
                          variant="secondary"
                          className="w-full"
                        >
                          Complete +100 <TicketIcon />
                        </Button>
                      </div>
                    )}
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
