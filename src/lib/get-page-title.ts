import { getEnvHintTitlePrefix } from '@/features/devtools/env-hint';

export const getPageTitle = (pageTitle?: string) =>
  pageTitle
    ? `${getEnvHintTitlePrefix()} ${pageTitle} | Fork it! Tickets Hunt`
    : `${getEnvHintTitlePrefix()} Fork it! Tickets Hunt`;
