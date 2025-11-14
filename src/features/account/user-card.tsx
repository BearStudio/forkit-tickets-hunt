import { LogOutIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';

import { authClient } from '@/features/auth/client';
import { ConfirmSignOut } from '@/features/auth/confirm-signout';

export const UserCard = () => {
  const { t } = useTranslation(['auth', 'account']);
  const session = authClient.useSession();
  return (
    <Card className="gap-0 p-0">
      <CardHeader className="gap-y-0 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarImage src={session.data?.user.image ?? undefined} />
            <AvatarFallback
              variant="boring"
              name={session.data?.user.name ?? ''}
            />
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle className="truncate">
              {session.data?.user.name || session.data?.user.email || (
                <span className="text-xs text-muted-foreground">--</span>
              )}
            </CardTitle>
          </div>
        </div>
        <CardAction>
          <ConfirmSignOut>
            <Button size="sm" variant="ghost">
              <LogOutIcon />
              {t('auth:signOut.action')}
            </Button>
          </ConfirmSignOut>
        </CardAction>
      </CardHeader>
    </Card>
  );
};
