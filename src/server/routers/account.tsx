import { z } from 'zod';

import i18n from '@/lib/i18n';

import TemplateOnboarded from '@/emails/templates/onboarded';
import { zFormFieldsOnboarding } from '@/features/auth/schema';
import { zUser } from '@/features/user/schema';
import { sendEmail } from '@/server/email';
import { protectedProcedure } from '@/server/orpc';
import { getUserLanguage } from '@/server/utils';

const tags = ['account'];

export default {
  submitOnboarding: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/account/submit-onboarding',
      tags,
    })
    .input(zFormFieldsOnboarding())
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.db.user.update({
        where: { id: context.user.id },
        data: {
          ...input,
          onboardedAt: new Date(),
        },
      });
      await sendEmail({
        to: context.user.email,
        subject: i18n.t('emails:onboarded.subject', {
          lng: getUserLanguage(),
        }),
        template: (
          <TemplateOnboarded language={getUserLanguage()} user={context.user} />
        ),
      });
    }),

  updateInfo: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/account/info',
      tags,
    })
    .input(
      zUser().pick({
        name: true,
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.db.user.update({
        where: { id: context.user.id },
        data: {
          name: input.name ?? '',
        },
      });
    }),
};
