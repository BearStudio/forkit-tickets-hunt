import { useQuery } from '@tanstack/react-query';

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

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';
import { TicketIcon } from '@/components/ui/ticket-icon';

export const PageDashboard = () => {
  const leaderboardQuery = useQuery(
    orpc.user.getLeaderboard.queryOptions({ input: { limit: 50 } })
  );

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Dashboard</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent containerClassName="max-w-4xl">
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="mb-2 text-base font-semibold">Leaderboard</h2>
            <DataList>
              {leaderboardQuery.status === 'pending' && (
                <DataListLoadingState />
              )}
              {leaderboardQuery.status === 'error' && (
                <DataListErrorState retry={() => leaderboardQuery.refetch()} />
              )}
              {leaderboardQuery.status === 'success' &&
                leaderboardQuery.data.items.length === 0 && (
                  <DataListEmptyState />
                )}
              {leaderboardQuery.status === 'success' &&
                leaderboardQuery.data.items.map((item, index) => (
                  <DataListRow key={item.id}>
                    <DataListCell className="flex-none">
                      <span className="text-xs text-muted-foreground">
                        #{index + 1}
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
                    <DataListCell className="flex-none">
                      <DataListText className="text-xs text-muted-foreground">
                        {item.completedCount} completed
                      </DataListText>
                    </DataListCell>
                    <DataListCell className="flex-none">
                      <span className="flex gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {item.totalPoints} <TicketIcon className="w-5" />
                      </span>
                    </DataListCell>
                  </DataListRow>
                ))}
            </DataList>
          </section>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
