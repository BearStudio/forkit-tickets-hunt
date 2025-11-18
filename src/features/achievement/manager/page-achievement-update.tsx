import { zodResolver } from '@hookform/resolvers/zod';
import { ORPCError } from '@orpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FormAchievement } from '@/features/achievement/manager/form-achievement';
import { zFormFieldsAchievement } from '@/features/achievement/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageAchievementUpdate = (props: { params: { id: string } }) => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['achievement']);
  const achievementQuery = useQuery(
    orpc.achievement.getById.queryOptions({ input: { id: props.params.id } })
  );
  const form = useForm({
    resolver: zodResolver(zFormFieldsAchievement()),
    values: {
      name: achievementQuery.data?.name ?? '',
      hint: achievementQuery.data?.hint ?? '',
      points: achievementQuery.data?.points ?? 0,
      isSecret: achievementQuery.data?.isSecret ?? false,
      isHidden: achievementQuery.data?.isHidden ?? false,
      emoji: achievementQuery.data?.emoji ?? '',
      imageUrl: achievementQuery.data?.imageUrl ?? '',
      type: achievementQuery.data?.type ?? 'CUSTOM',
      key: achievementQuery.data?.key ?? '',
    },
  });

  const achievementUpdate = useMutation(
    orpc.achievement.updateById.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.achievement.getAll.key(),
          type: 'all',
        });

        if (canGoBack) {
          router.history.back({ ignoreBlocker: true });
        } else {
          router.navigate({ to: '..', replace: true, ignoreBlocker: true });
        }
      },
      onError: (error) => {
        if (error instanceof ORPCError && error.code === 'CONFLICT') {
          toast.error(t('achievement:manager.update.conflict'));
          return;
        }
        toast.error(t('achievement:manager.update.updateError'));
      },
    })
  );

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form
        {...form}
        onSubmit={async (values) => {
          achievementUpdate.mutate({ id: props.params.id, ...values });
        }}
      >
        <PageLayout>
          <PageLayoutTopBar
            backButton={<BackButton />}
            actions={
              <Button
                size="sm"
                type="submit"
                className="min-w-20"
                loading={achievementUpdate.isPending}
              >
                {t('achievement:manager.update.updateButton.label')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {t('achievement:manager.update.title')}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <div className="flex flex-col gap-4 xs:flex-row">
              <div className="flex-2">
                <Card>
                  <CardContent>
                    <FormAchievement />
                  </CardContent>
                </Card>
              </div>
            </div>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
