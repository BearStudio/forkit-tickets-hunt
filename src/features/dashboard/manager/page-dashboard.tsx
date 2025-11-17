import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';
import { cn } from '@/lib/tailwind/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketIcon } from '@/components/ui/ticket-icon';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageDashboard = () => {
  const { t } = useTranslation(['home']);
  const leaderboardQuery = useQuery(
    orpc.user.getLeaderboard.queryOptions({ input: { limit: 50 } })
  );

  const ui = getUiState((set) => {
    if (leaderboardQuery.status === 'pending') return set('pending');
    if (leaderboardQuery.status === 'error') return set('error');
    if (
      leaderboardQuery.status === 'success' &&
      leaderboardQuery.data.items.length === 0
    )
      return set('empty');
    return set('default', leaderboardQuery.data);
  });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Leaderboard</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent containerClassName="max-w-6xl">
        <div className="flex flex-col gap-6">
          <div className="flex gap-6 max-md:flex-col">
            {ui
              .match('pending', () => (
                <>
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </>
              ))
              .match('error', () => null)
              .match('empty', () => null)
              .match('default', (data) => {
                return data.podium.map((item, index) => (
                  <Card
                    key={item.id}
                    className="w-full items-center justify-center text-center"
                  >
                    <CardContent className="flex flex-col items-center justify-center gap-6 py-4">
                      <div className="relative flex size-36 flex-col items-center justify-center rounded-full border-1 border-white/10 bg-white/5 shadow-2xl shadow-white/10">
                        <Avatar className="size-36">
                          <AvatarImage src={item.image ?? undefined} />
                          <AvatarFallback
                            variant="initials"
                            name={item.name ?? ''}
                          />
                        </Avatar>
                        <div
                          className={cn(
                            'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-sm px-3 py-0.5 text-accent-foreground',
                            index === 0 && 'bg-[#d5c388]',
                            index === 1 && 'bg-[#c0c0c0]',
                            index === 2 && 'bg-[#c79b56]'
                          )}
                        >
                          <span className="block text-xl font-bold">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      <p>{item.name}</p>
                      <div className="flex flex-wrap items-center justify-center gap-4 text-left">
                        <div className="flex items-center gap-2">
                          <div className="text-3xl font-bold">
                            {item.completedCount}
                          </div>
                          <div className="text-2xs opacity-60">
                            {t('home:rank.achievements')}
                            <br />
                            {t('home:rank.completed')}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-center">
                          <div className="text-3xl font-bold">
                            {item.totalPoints}
                          </div>
                          <TicketIcon className="w-12" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })
              .exhaustive()}
          </div>
          <DataList>
            {ui
              .match('pending', () => <DataListLoadingState />)
              .match('error', () => (
                <DataListErrorState retry={() => leaderboardQuery.refetch()} />
              ))
              .match('empty', () => <DataListEmptyState />)
              .match('default', (data) =>
                data.items.map((item, index) => (
                  <DataListRow key={item.id}>
                    <DataListCell className="flex-none">
                      <span className="text-xs text-muted-foreground">
                        #{index + 4}
                      </span>
                    </DataListCell>
                    <DataListCell className="flex-none">
                      <Avatar className="size-8">
                        <AvatarImage src={item.image ?? undefined} alt="" />
                        <AvatarFallback>
                          {item.name?.slice(0, 1) ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </DataListCell>
                    <DataListCell>
                      <DataListText className="font-medium">
                        {item.name}
                      </DataListText>
                    </DataListCell>
                    <DataListCell>
                      <DataListText className="flex items-center gap-1.5">
                        <span className="text-base">{item.completedCount}</span>{' '}
                        <span className="text-xs text-muted-foreground">
                          {t('home:rank.completed')}
                        </span>
                      </DataListText>
                    </DataListCell>
                    <DataListCell>
                      <span className="flex items-center gap-1.5">
                        {item.totalPoints} <TicketIcon className="w-5" />
                      </span>
                    </DataListCell>
                  </DataListRow>
                ))
              )
              .exhaustive()}
          </DataList>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
