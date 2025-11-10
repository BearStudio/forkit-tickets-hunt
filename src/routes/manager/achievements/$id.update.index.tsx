import { createFileRoute } from '@tanstack/react-router';

import { PageAchievementUpdate } from '@/features/achievement/manager/page-achievement-update';

export const Route = createFileRoute('/manager/achievements/$id/update/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageAchievementUpdate params={params} />;
}
