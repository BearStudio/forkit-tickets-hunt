import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type Achievement = z.infer<ReturnType<typeof zAchievement>>;

export const zAchievement = () =>
  z.object({
    id: z.string(),
    key: z.string(),
    name: zu.fieldText.required(),
    hint: zu.fieldText.nullish(),
    points: z.coerce.number().int(),
    isSecret: z.boolean().default(false),
    emoji: zu.fieldText.nullish(),
    imageUrl: zu.fieldText.nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type FormFieldsAchievement = z.infer<
  ReturnType<typeof zFormFieldsAchievement>
>;
export const zFormFieldsAchievement = () =>
  zAchievement().pick({
    name: true,
    hint: true,
    points: true,
    isSecret: true,
    emoji: true,
    imageUrl: true,
  });

export const zAchievementWithCompletion = () =>
  zAchievement().extend({
    completed: z.boolean(),
  });
