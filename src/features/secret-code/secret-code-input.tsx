import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { getAchievementLinkBySecretId } from '@/features/achievement/get-achievement-link';

export const SecretCodeInput = () => {
  const router = useRouter();
  const { t } = useTranslation(['secretCode']);

  const [code, setCode] = useState('');

  const checkCode = useMutation(
    orpc.achievement.checkSecretCode.mutationOptions({
      onSuccess: (data) => {
        router.navigate({ href: getAchievementLinkBySecretId(data.secretId) });
      },
      onSettled: () => {
        setCode('');
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
    <div className="flex flex-col gap-4">
      <div>
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            checkCode.reset();
          }}
          aria-invalid={checkCode.status === 'error' ? true : undefined}
        />
        {ui.when('not-found', () => (
          <p className="text-destructive">{t('secretCode:input.invalid')}</p>
        ))}
        {ui.when('error', () => (
          <p className="text-destructive">{t('secretCode:input.error')}</p>
        ))}
      </div>
      <Button
        loading={checkCode.isPending}
        onClick={() => checkCode.mutate({ secretCode: code })}
        className="w-full"
      >
        {t('secretCode:input.submit')}
      </Button>
    </div>
  );
};
