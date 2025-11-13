import { createFileRoute } from '@tanstack/react-router';

import { PageAchievements } from '@/features/achievement/app/page-achievements';

export const Route = createFileRoute('/app/achievements/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageAchievements />;
}
