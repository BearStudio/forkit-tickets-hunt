import { createFileRoute } from '@tanstack/react-router';

import { PageAchievementNew } from '@/features/achievement/manager/page-achievement-new';

export const Route = createFileRoute('/manager/achievements/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageAchievementNew />;
}
