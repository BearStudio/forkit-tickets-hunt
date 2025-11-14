import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { getAchievementLinkBySecretId } from '@/features/achievement/get-achievement-link';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageSecretCode = () => {
  const router = useRouter();

  const [code, setCode] = useState('');

  const checkCode = useMutation(
    orpc.achievement.checkSecretCode.mutationOptions({
      onSuccess: (data) => {
        router.navigate({ href: getAchievementLinkBySecretId(data.secretId) });
      },
    })
  );

  const ui = getUiState((set) => {
    if (checkCode.status === 'pending') return set('pending');

    if (
      checkCode.status === 'error' &&
      checkCode.error instanceof ORPCError &&
      checkCode.error.code === 'NOT_FOUND'
    )
      return set('not-found');

    if (checkCode.status === 'error') return set('error');

    return set('default');
  });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Secret Code</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="mt-2 flex flex-col gap-4">
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
          <Button
            loading={checkCode.isPending}
            onClick={() => checkCode.mutate({ secretCode: code })}
          >
            Check Code
          </Button>
          {ui.when('not-found', () => (
            <div>Code not found</div>
          ))}
          {ui.when('error', () => (
            <div>Not valid code</div>
          ))}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
