import { useFormContext } from 'react-hook-form';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsAchievement } from '@/features/achievement/schema';

export const FormAchievement = () => {
  const form = useFormContext<FormFieldsAchievement>();

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Secret</FormFieldLabel>
        <FormFieldController
          type="checkbox"
          control={form.control}
          name="isSecret"
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Hint</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="hint" />
      </FormField>
      <FormField>
        <FormFieldLabel>Points</FormFieldLabel>
        <FormFieldController
          type="number"
          control={form.control}
          name="points"
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Emoji</FormFieldLabel>
        <FormFieldController type="text" control={form.control} name="emoji" />
      </FormField>
      <FormField>
        <FormFieldLabel>Image URL</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="imageUrl"
        />
      </FormField>
    </div>
  );
};
