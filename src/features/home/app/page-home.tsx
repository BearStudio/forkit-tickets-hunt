import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { Logo } from '@/components/brand/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketIcon } from '@/components/ui/ticket-icon';

import { authClient } from '@/features/auth/client';
import { SecretCodeInput } from '@/features/secret-code/secret-code-input';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageHome = () => {
  const query = useQuery(orpc.user.getCurrentUserRank.queryOptions());
  const session = authClient.useSession();
  const { t } = useTranslation(['home', 'secretCode']);
  return (
    <PageLayout>
      <PageLayoutTopBar className="md:hidden">
        <Logo className="mx-auto w-28" />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-1 flex-col items-center justify-center gap-0">
          <div className="flex flex-col items-center justify-center gap-8 p-4">
            <div className="flex flex-col gap-3">
              <div className="relative flex size-36 flex-col items-center justify-center rounded-full border-1 border-white/10 bg-white/5 shadow-2xl shadow-white/10">
                <Avatar className="size-36">
                  <AvatarImage src={session.data?.user.image ?? undefined} />
                  <AvatarFallback
                    variant="boring"
                    name={session.data?.user.name ?? ''}
                  />
                </Avatar>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-sm bg-accent px-3 py-0.5 text-accent-foreground">
                  {query.status === 'pending' && (
                    <Skeleton className="mx-auto h-6 w-8" />
                  )}
                  {query.status === 'success' && (
                    <span className="text-xl font-bold">
                      #{query.data.rank}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <div className="flex items-center gap-2 p-4">
                  <div className="text-4xl font-bold">
                    {query.data?.completedCount}
                  </div>
                  <div className="text-xs opacity-60">
                    {t('home:rank.achievements')}
                    <br />
                    {t('home:rank.completed')}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 p-4 text-center">
                  <div className="text-4xl font-bold">
                    {query.data?.totalPoints}
                  </div>
                  <TicketIcon className="w-12" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <ResponsiveDrawer>
              <ResponsiveDrawerTrigger asChild>
                <Button variant="secondary" className="w-full">
                  {t('home:actions.secretCode')}
                </Button>
              </ResponsiveDrawerTrigger>
              <ResponsiveDrawerContent>
                <ResponsiveDrawerHeader>
                  <ResponsiveDrawerTitle>
                    {t('secretCode:drawer.title')}
                  </ResponsiveDrawerTitle>
                </ResponsiveDrawerHeader>
                <ResponsiveDrawerBody>
                  <SecretCodeInput />
                </ResponsiveDrawerBody>
              </ResponsiveDrawerContent>
            </ResponsiveDrawer>
            <Button variant="secondary" className="w-full" asChild>
              <Link to="/app/achievements">
                {t('home:actions.allAchievements')}
              </Link>
            </Button>
          </div>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
