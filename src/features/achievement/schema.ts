import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export const zAchievementType = () =>
  z.enum(['GITHUB_STAR', 'SECRET_CODE', 'IN_APP', 'CUSTOM']);
export type AchievementType = z.infer<ReturnType<typeof zAchievementType>>;

export const zAchievement = () =>
  z.object({
    id: z.string(),
    key: zu.fieldText.optional(),
    name: zu.fieldText.required(),
    hint: zu.fieldText.nullish(),
    points: z.coerce.number().int(),
    isSecret: z.boolean().default(false),
    type: zAchievementType().default('CUSTOM'),
    emoji: zu.fieldText.nullish(),
    imageUrl: zu.fieldText.nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });
export type Achievement = z.infer<ReturnType<typeof zAchievement>>;

export type FormFieldsAchievement = z.infer<
  ReturnType<typeof zFormFieldsAchievement>
>;
export const zFormFieldsAchievement = () =>
  zAchievement().pick({
    name: true,
    hint: true,
    points: true,
    isSecret: true,
    type: true,
    emoji: true,
    imageUrl: true,
    key: true,
  });

export const zAchievementWithCompletion = () =>
  zAchievement().extend({
    completed: z.boolean(),
  });
