import { useQuery } from '@tanstack/react-query';
import { TrophyIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { Card, CardContent } from '@/components/ui/card';
import { DataListText } from '@/components/ui/datalist';
import { Skeleton } from '@/components/ui/skeleton';

export const CurrentUserRank = () => {
  const query = useQuery(orpc.user.getCurrentUserRank.queryOptions());

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex size-10 items-center justify-center rounded-full bg-muted"
          >
            <TrophyIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Your position</span>
            {query.status === 'pending' && (
              <Skeleton className="mt-1 h-4 w-24" />
            )}
            {query.status === 'success' && (
              <DataListText className="text-xs text-muted-foreground">
                {query.data.completedCount} completed • {query.data.totalPoints}{' '}
                pts
              </DataListText>
            )}
          </div>
        </div>
        <div className="text-right">
          {query.status === 'pending' && (
            <Skeleton className="ml-auto h-6 w-10" />
          )}
          {query.status === 'success' && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
              #{query.data.rank}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
