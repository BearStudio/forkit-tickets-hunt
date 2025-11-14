import { Link } from '@tanstack/react-router';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

import { GithubClaim } from '@/features/home/app/github-claim';
import { CurrentUserRank } from '@/features/user/app/current-user-rank';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageHome = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar className="md:hidden">
        <Logo className="mx-auto w-28" />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <CurrentUserRank />
          <GithubClaim />
          <Button variant="secondary" asChild>
            <Link to="/app/achievements">View All Achievements</Link>
          </Button>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
