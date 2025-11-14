import { ValidateLinkOptions } from '@tanstack/react-router';
import { FC } from 'react';

import {
  IconCrownSimpleDuotone,
  IconCrownSimpleFill,
  IconTrophyDuotone,
  IconTrophyFill,
  IconUserCircleDuotone,
  IconUserCircleFill,
} from '@/components/icons/generated';

export const MAIN_NAV_LINKS = [
  {
    labelTranslationKey: 'layout:nav.home',
    icon: IconCrownSimpleDuotone,
    iconActive: IconCrownSimpleFill,
    linkOptions: {
      to: '/app',
    },
    exact: true,
  } as const,
  {
    labelTranslationKey: 'layout:nav.secretCode',
    icon: IconCrownSimpleDuotone,
    iconActive: IconCrownSimpleFill,
    linkOptions: {
      to: '/app/secret-code',
    },
    exact: true,
  } as const,
  {
    labelTranslationKey: 'layout:nav.achievements',
    icon: IconTrophyDuotone,
    iconActive: IconTrophyFill,
    linkOptions: {
      to: '/app/achievements',
    },
  } as const,
  {
    labelTranslationKey: 'layout:nav.account',
    icon: IconUserCircleDuotone,
    iconActive: IconUserCircleFill,
    linkOptions: {
      to: '/app/account',
    },
  } as const,
] satisfies Array<{
  labelTranslationKey: string;
  icon: FC<{ className?: string }>;
  iconActive?: FC<{ className?: string }>;
  linkOptions: ValidateLinkOptions;
  exact?: boolean;
}>;
