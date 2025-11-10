import { createFileRoute } from '@tanstack/react-router';

import { PageAchievement } from '@/features/achievement/manager/page-achievement';

export const Route = createFileRoute('/manager/achievements/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageAchievement params={params} />;
}
