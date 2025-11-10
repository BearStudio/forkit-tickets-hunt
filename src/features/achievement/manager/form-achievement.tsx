import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsAchievement } from '@/features/achievement/schema';

export const FormAchievement = () => {
  const form = useFormContext<FormFieldsAchievement>();
  const { t } = useTranslation(['achievement']);

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>{t('achievement:common.name.label')}</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('achievement:common.secret.label')}</FormFieldLabel>
        <FormFieldController
          type="checkbox"
          control={form.control}
          name="isSecret"
        />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('achievement:common.hint.label')}</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="hint" />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('achievement:common.points.label')}</FormFieldLabel>
        <FormFieldController
          type="number"
          control={form.control}
          name="points"
        />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('achievement:common.emoji.label')}</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="emoji" />
      </FormField>
      <FormField>
        <FormFieldLabel>
          {t('achievement:common.imageUrl.label')}
        </FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="imageUrl"
        />
      </FormField>
    </div>
  );
};
