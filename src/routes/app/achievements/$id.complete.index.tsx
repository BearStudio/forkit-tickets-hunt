import { createFileRoute } from '@tanstack/react-router';

import { PageAchievementComplete } from '@/features/achievement/app/page-achievement-complete';

export const Route = createFileRoute('/app/achievements/$id/complete/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageAchievementComplete />;
}
