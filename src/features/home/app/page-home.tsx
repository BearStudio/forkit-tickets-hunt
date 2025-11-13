import { Logo } from '@/components/brand/logo';

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
        <div className="flex flex-1 flex-col gap-4">
          <CurrentUserRank />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
