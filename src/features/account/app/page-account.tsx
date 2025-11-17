import { useTranslation } from 'react-i18next';

import LightRays from '@/components/light-rays';
import { Button } from '@/components/ui/button';

import { DisplayPreferences } from '@/features/account/display-preferences';
import { UserCard } from '@/features/account/user-card';
import { BuildInfoDrawer } from '@/features/build-info/build-info-drawer';
import { BuildInfoVersion } from '@/features/build-info/build-info-version';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAccount = () => {
  const { t } = useTranslation(['account']);
  return (
    <PageLayout>
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
        <LightRays
          raysOrigin="top-center"
          raysColor="#F3FF6D"
          raysSpeed={0.2}
          lightSpread={0.8}
          rayLength={10}
          fadeDistance={10}
          followMouse={true}
          mouseInfluence={0.05}
          noiseAmount={0.15}
          distortion={0.05}
          saturation={5}
        />
      </div>
      <PageLayoutTopBar className="md:hidden">
        <h1 className="text-base font-medium md:text-sm">
          {t('account:title')}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-4">
          <UserCard />
          <DisplayPreferences />
          <BuildInfoDrawer>
            <Button variant="ghost" size="xs" className="opacity-60">
              <BuildInfoVersion />
            </Button>
          </BuildInfoDrawer>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
