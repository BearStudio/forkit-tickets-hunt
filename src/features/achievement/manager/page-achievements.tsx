import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { PlusIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListRowResults,
  DataListText,
} from '@/components/ui/datalist';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { SearchButton } from '@/components/ui/search-button';
import { SearchInput } from '@/components/ui/search-input';
import { TicketIcon } from '@/components/ui/ticket-icon';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageAchievements = (props: {
  search: { searchTerm?: string };
}) => {
  const router = useRouter();
  const { t } = useTranslation(['achievement']);

  const searchInputProps = {
    value: props.search.searchTerm ?? '',
    onChange: (value: string) =>
      router.navigate({
        to: '.',
        search: { searchTerm: value },
        replace: true,
      }),
  };

  const achievementsQuery = useInfiniteQuery(
    orpc.achievement.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({
        searchTerm: props.search.searchTerm,
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

    const searchTerm = props.search.searchTerm;
    const items = achievementsQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length && searchTerm) {
      return set('empty-search', { searchTerm });
    }
    if (!items.length) return set('empty');

    return set('default', {
      items,
      searchTerm,
      total: achievementsQuery.data.pages[0]?.total ?? 0,
    });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        actions={
          <ResponsiveIconButton
            asChild
            label={t('achievement:manager.list.new.label')}
            variant="secondary"
            size="sm"
          >
            <Link to="/manager/achievements/new">
              <PlusIcon />
            </Link>
          </ResponsiveIconButton>
        }
      >
        <PageLayoutTopBarTitle>
          {t('achievement:manager.list.title')}
        </PageLayoutTopBarTitle>
        <SearchButton
          {...searchInputProps}
          className="-mx-2 md:hidden"
          size="icon-sm"
        />
        <SearchInput
          {...searchInputProps}
          size="sm"
          className="max-w-2xs max-md:hidden"
        />
      </PageLayoutTopBar>
      <PageLayoutContent className="pb-20">
        <DataList>
          {ui
            .match('pending', () => <DataListLoadingState />)
            .match('error', () => (
              <DataListErrorState retry={() => achievementsQuery.refetch()} />
            ))
            .match('empty', () => <DataListEmptyState />)
            .match('empty-search', ({ searchTerm }) => (
              <DataListEmptyState searchTerm={searchTerm} />
            ))
            .match('default', ({ items, searchTerm, total }) => (
              <>
                {!!searchTerm && (
                  <DataListRowResults
                    withClearButton
                    onClear={() => {
                      router.navigate({
                        to: '.',
                        search: { searchTerm: '' },
                        replace: true,
                      });
                    }}
                  >
                    {t('achievement:common.searchResults', {
                      total,
                      searchTerm,
                    })}
                  </DataListRowResults>
                )}
                {items.map((item) => (
                  <DataListRow key={item.id} withHover>
                    <DataListCell className="flex-none">
                      <div
                        aria-hidden
                        className="flex size-8 items-center justify-center rounded-md bg-muted"
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
                        <Link
                          to="/manager/achievements/$id"
                          params={{ id: item.id }}
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </Link>
                      </DataListText>
                      <DataListText className="text-xs text-muted-foreground">
                        {item.hint}
                      </DataListText>
                    </DataListCell>
                    <DataListCell className="max-w-16">
                      {item.isSecret && (
                        <Badge className="w-full" variant="outline">
                          {t('achievement:common.secret.label')}
                        </Badge>
                      )}
                    </DataListCell>
                    <DataListCell className="max-w-40">
                      {item.type !== 'CUSTOM' && (
                        <Badge className="self-center">
                          {t(`achievement:common.type.options.${item.type}`)}
                        </Badge>
                      )}
                    </DataListCell>
                    <DataListCell className="flex-none">
                      <DataListText className="flex gap-1.5 text-xs text-muted-foreground">
                        +{item.points} <TicketIcon />
                      </DataListText>
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
                      {t('achievement:common.loadMore')}
                    </Button>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-xs text-muted-foreground">
                      {t('achievement:common.showingOf', {
                        count: items.length,
                        total,
                      })}
                    </DataListText>
                  </DataListCell>
                </DataListRow>
              </>
            ))
            .exhaustive()}
        </DataList>
      </PageLayoutContent>
    </PageLayout>
  );
};
