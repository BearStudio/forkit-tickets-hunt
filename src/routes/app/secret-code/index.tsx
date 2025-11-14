import { createFileRoute } from '@tanstack/react-router';

import { PageSecretCode } from '@/features/secret-code/page-secret-code';

export const Route = createFileRoute('/app/secret-code/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageSecretCode />;
}
