import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';
import { TicketIcon } from '@/components/ui/ticket-icon';

import { envClient } from '@/env/client';
import { authClient } from '@/features/auth/client';
import { AUTH_SIGNUP_ENABLED } from '@/features/auth/config';
import { useMascot } from '@/features/auth/mascot';
import { FormFieldsLogin, zFormFieldsLogin } from '@/features/auth/schema';

const I18N_KEY_PAGE_PREFIX = AUTH_SIGNUP_ENABLED
  ? ('auth:pageLoginWithSignUp' as const)
  : ('auth:pageLogin' as const);

export default function PageLogin({
  search,
}: {
  search: { redirect?: string };
}) {
  const { t } = useTranslation(['auth', 'common', 'achievement']);
  const router = useRouter();
  const social = useMutation({
    mutationFn: async (
      provider: Parameters<typeof authClient.signIn.social>[0]['provider']
    ) => {
      const response = await authClient.signIn.social({
        provider,
        callbackURL: search.redirect ?? '/',
        errorCallbackURL: '/login/error',
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onError: (error) => {
      form.setError('email', { message: error.message });
      toast.error(error.message);
    },
  });

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(zFormFieldsLogin()),
    defaultValues: {
      email: '',
    },
  });

  const { isValid, isSubmitted } = form.formState;
  useMascot({ isError: !isValid && isSubmitted });

  const submitHandler: SubmitHandler<FormFieldsLogin> = async ({ email }) => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: 'sign-in',
    });

    if (error) {
      toast.error(
        error.code
          ? t(
              `auth:errorCode.${error.code as unknown as keyof typeof authClient.$ERROR_CODES}`
            )
          : error.message || t('auth:errorCode.UNKNOWN_ERROR')
      );
      return;
    }

    router.navigate({
      replace: true,
      to: '/login/verify',
      search: {
        redirect: search.redirect,
        email,
      },
    });
  };

  return (
    <Form {...form} onSubmit={submitHandler} className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-base font-medium opacity-60">
          {envClient.VITE_EVENT_NAME}
        </h2>
        <h1 className="text-2xl font-bold">
          {t(`${I18N_KEY_PAGE_PREFIX}.title`)}
        </h1>
      </div>
      <div className="grid gap-6">
        <Button
          className="w-full overflow-visible"
          disabled={envClient.VITE_IS_DEMO}
          loading={
            social.variables === 'github' &&
            (social.isPending || social.isSuccess)
          }
          size="lg"
          onClick={() => social.mutate('github')}
        >
          {t(`${I18N_KEY_PAGE_PREFIX}.loginWithSocial`, {
            provider: 'GitHub',
          })}
        </Button>
      </div>
      <p className="max-w-[60ch] text-center text-sm text-balance text-foreground/60">
        <Trans
          t={t}
          i18nKey={'achievement:app.instructions'}
          components={{
            ticket: <TicketIcon />,
          }}
        />
      </p>
    </Form>
  );
}
