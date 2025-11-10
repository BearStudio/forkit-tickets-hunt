import { zodResolver } from '@hookform/resolvers/zod';
import { ORPCError } from '@orpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
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

export const PageAchievementNew = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(zFormFieldsAchievement()),
    values: {
      name: '',
      hint: '',
      points: 100,
      isSecret: false,
      emoji: '',
      imageUrl: '',
    },
  });

  const achievementCreate = useMutation(
    orpc.achievement.create.mutationOptions({
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
          toast.error('An achievement with this name already exists.');
          return;
        }
        toast.error('Unable to create achievement');
      },
    })
  );

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form
        {...form}
        onSubmit={async (values) => {
          achievementCreate.mutate(values);
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
                loading={achievementCreate.isPending}
              >
                Create
              </Button>
            }
          >
            <PageLayoutTopBarTitle>New achievement</PageLayoutTopBarTitle>
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
