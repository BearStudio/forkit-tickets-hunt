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
        <FormFieldLabel>{t('achievement:common.hint.label')}</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="hint" />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('achievement:common.secret.label')}</FormFieldLabel>
        <FormFieldController
          type="checkbox"
          control={form.control}
          name="isSecret"
        />
      </FormField>
      <div className="flex gap-2">
        <FormField>
          <FormFieldLabel>{t('achievement:common.type.label')}</FormFieldLabel>
          <FormFieldController
            type="select"
            control={form.control}
            name="type"
            options={[
              {
                label: t('achievement:common.type.options.GITHUB_STAR'),
                id: 'GITHUB_STAR',
              },
              {
                label: t('achievement:common.type.options.SECRET_CODE'),
                id: 'SECRET_CODE',
              },
              {
                label: t('achievement:common.type.options.CUSTOM'),
                id: 'CUSTOM',
              },
            ]}
          />
        </FormField>
        {['GITHUB_STAR', 'SECRET_CODE'].includes(form.watch('type')) && (
          <FormField>
            <FormFieldLabel>{t('achievement:common.key.label')}</FormFieldLabel>
            <FormFieldController
              type="text"
              control={form.control}
              name="key"
            />
          </FormField>
        )}
      </div>
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
