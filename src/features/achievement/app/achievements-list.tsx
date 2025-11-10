import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CheckIcon, TrophyIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';

export const AchievementsList = () => {
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Achievements</h2>
      </div>
      <DataList>
        {ui
          .match('pending', () => <DataListLoadingState />)
          .match('error', () => (
            <DataListErrorState retry={() => achievementsQuery.refetch()} />
          ))
          .match('empty', () => <DataListEmptyState />)
          .match('default', ({ items, total }) => (
            <>
              {items.map((item) => (
                <DataListRow key={item.id}>
                  <DataListCell className="flex-none">
                    <div
                      aria-hidden
                      className={`flex size-8 items-center justify-center rounded-md bg-muted ${
                        item.isSecret && !item.completed ? 'blur-xs' : ''
                      }`}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-5 w-5 rounded object-cover"
                        />
                      )}
                      {!item.imageUrl && item.emoji && (
                        <span className="text-lg">{item.emoji}</span>
                      )}
                      {!item.imageUrl && !item.emoji && (
                        <TrophyIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="font-medium">
                      {item.name}
                    </DataListText>
                    <DataListText className="text-xs text-muted-foreground">
                      {item.hint}
                    </DataListText>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-xs text-muted-foreground">
                      {item.points} pts
                    </DataListText>
                  </DataListCell>
                  <DataListCell className="flex-none">
                    {item.completed ? (
                      <div className="bg-green-600/10 text-green-700 dark:text-green-400 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium">
                        <CheckIcon className="size-3" />
                        Completed
                      </div>
                    ) : (
                      <div className="bg-amber-600/10 text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium">
                        Not completed
                      </div>
                    )}
                  </DataListCell>
                </DataListRow>
              ))}
              <DataListRow>
                <DataListCell className="flex-none">
                  <Button
                    size="xs"
                    variant="secondary"
                    disabled={!achievementsQuery.hasNextPage}
                    onClick={() => achievementsQuery.fetchNextPage()}
                    loading={achievementsQuery.isFetchingNextPage}
                  >
                    Load more
                  </Button>
                </DataListCell>
                <DataListCell>
                  <DataListText className="text-xs text-muted-foreground">
                    Showing {items.length} of {total}
                  </DataListText>
                </DataListCell>
              </DataListRow>
            </>
          ))
          .exhaustive()}
      </DataList>
    </div>
  );
};
