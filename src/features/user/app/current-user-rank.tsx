import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { IconCrownSimpleDuotone } from '@/components/icons/generated';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketIcon } from '@/components/ui/ticket-icon';

export const CurrentUserRank = () => {
  const query = useQuery(orpc.user.getCurrentUserRank.queryOptions());
  const { t } = useTranslation(['home']);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
      <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {t('home:rank.title')}
      </h2>
      <div className="flex flex-col gap-3">
        <div className="flex size-36 flex-col items-center justify-center rounded-full border-1 border-white/10 bg-white/5 shadow-2xl shadow-white/10">
          <IconCrownSimpleDuotone className="size-16" />
          {query.status === 'pending' && (
            <Skeleton className="mx-auto h-6 w-8" />
          )}
          {query.status === 'success' && (
            <span className="text-xl font-bold">#{query.data.rank}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <div className="flex items-center gap-2 p-4">
            <div className="text-4xl font-bold">
              {query.data?.completedCount}
            </div>
            <div className="text-xs opacity-60">
              Achievements
              <br />
              Completed
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 p-4 text-center">
            <div className="text-4xl font-bold">{query.data?.totalPoints}</div>
            <TicketIcon className="w-12" />
          </div>
        </div>
        <Button variant="secondary" asChild>
          <Link to="/app/achievements">View All Achievements</Link>
        </Button>
      </div>
    </div>
  );
};
