import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useEffect } from 'react';
import z from 'zod';

import { PageAchievementComplete } from '@/features/achievement/app/page-achievement-complete';
import { useShouldShowNav } from '@/layout/app/layout';

export const Route = createFileRoute('/app/achievements/complete/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      id: z.string().prefault(''),
      masked: z.boolean().default(false),
    })
  ),
  search: {
    middlewares: [stripSearchParams({ id: '', masked: false })],
  },
});

function RouteComponent() {
  useShouldShowNav('none');

  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  useEffect(() => {
    // hide id from url but keep it in search
    // masked search param allows to trigger the update
    navigate({
      to: '/app/achievements/complete',
      search: { id: search.id, masked: true },
      replace: true,
      mask: {
        from: '/app/achievements/complete',
        to: '/app/achievements/complete',
        search: { id: '', masked: false },
      },
    });
  }, [search.id, navigate]);

  return <PageAchievementComplete secretId={search.id} />;
}
