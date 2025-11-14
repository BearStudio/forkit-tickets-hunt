import { createFileRoute } from '@tanstack/react-router';

import { PageAchievementComplete } from '@/features/achievement/app/page-achievement-complete';
import { useShouldShowNav } from '@/layout/app/layout';

export const Route = createFileRoute('/app/achievements/$id/complete/')({
  component: RouteComponent,
});

function RouteComponent() {
  useShouldShowNav('none');

  return <PageAchievementComplete />;
}
