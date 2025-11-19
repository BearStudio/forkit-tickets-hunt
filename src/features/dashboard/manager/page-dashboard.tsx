import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import * as motion from 'motion/react-client';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

import { envClient } from '@/env/client';
import { PodiumCard } from '@/features/dashboard/manager/podium-card';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageDashboard = () => {
  const { t } = useTranslation(['home']);
  const leaderboardQuery = useQuery(
    orpc.user.getLeaderboard.queryOptions({
      input: { limit: 50 },
      refetchInterval: 10000,
    })
  );

  const ui = getUiState((set) => {
    if (leaderboardQuery.status === 'pending') return set('pending');
    if (leaderboardQuery.status === 'error') return set('error');
    if (
      leaderboardQuery.status === 'success' &&
      leaderboardQuery.data.podium.length === 0
    )
      return set('empty');
    return set('default', leaderboardQuery.data);
  });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>
          Leaderboard {envClient.VITE_EVENT_NAME}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent containerClassName="max-w-6xl">
        <div className="flex flex-col gap-6">
          <div className="flex gap-6 max-lg:flex-col">
            {ui
              .match('pending', () => (
                <div className="my-6 grid w-full grid-cols-1 gap-6 lg:translate-x-2 lg:grid-cols-3">
                  <Skeleton className="h-80 w-full lg:translate-x-2 lg:translate-y-4 lg:scale-90" />
                  <Skeleton className="h-80 w-full" />
                  <Skeleton className="h-80 w-full lg:-translate-x-8 lg:translate-y-8 lg:scale-80" />
                </div>
              ))
              .match('error', () => null)
              .match('empty', () => null)
              .match('default', (data) => (
                <div className="my-6 grid w-full grid-cols-1 gap-6 lg:translate-x-2 lg:grid-cols-3">
                  {data.podium[0] && (
                    <PodiumCard
                      key={data.podium[0].id}
                      position={1}
                      data={data.podium[0]}
                      className="lg:col-2 lg:row-end-1"
                    />
                  )}
                  {data.podium[1] && (
                    <PodiumCard
                      key={data.podium[1].id}
                      position={2}
                      data={data.podium[1]}
                      className="lg:col-1 lg:row-end-1 lg:translate-x-2 lg:translate-y-4 lg:scale-90"
                    />
                  )}
                  {data.podium[2] && (
                    <PodiumCard
                      key={data.podium[2].id}
                      position={3}
                      data={data.podium[2]}
                      className="lg:col-3 lg:row-end-1 lg:-translate-x-8 lg:translate-y-8 lg:scale-80"
                    />
                  )}
                </div>
              ))
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
                  <motion.div
                    key={item.id}
                    transition={{
                      type: 'tween',
                      duration: 0.4,
                      ease: 'easeOut',
                    }}
                    layoutId={item.id}
                    layout
                    className="border-b last:border-none"
                  >
                    <DataListRow>
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
                      <DataListCell className="hidden md:flex">
                        <DataListText className="flex items-center gap-1.5">
                          <span className="text-base">
                            {item.completedCount}
                          </span>{' '}
                          <span className="text-xs text-muted-foreground">
                            {t('home:rank.completed')}
                          </span>
                        </DataListText>
                      </DataListCell>
                      <DataListCell className="max-w-16 md:max-w-none">
                        <span className="flex items-center gap-1.5">
                          {item.totalPoints} <TicketIcon className="w-5" />
                        </span>
                      </DataListCell>
                    </DataListRow>
                  </motion.div>
                ))
              )
              .exhaustive()}
          </DataList>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
