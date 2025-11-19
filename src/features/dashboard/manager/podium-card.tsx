import { t } from 'i18next';

import { cn } from '@/lib/tailwind/utils';

import LightRays from '@/components/light-rays';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { TicketIcon } from '@/components/ui/ticket-icon';

export const PodiumCard = ({
  position,
  data,
  className,
}: {
  position: number;
  data: {
    image?: string | null;
    name: string;
    completedCount: number;
    totalPoints: number;
  };
  className?: string;
}) => {
  const getColor = () => {
    if (position === 1) return '#d5c388';
    if (position === 2) return '#c0c0c0';
    if (position === 3) return '#c79b56';
    return '';
  };

  const color = getColor();

  return (
    <Card
      className={cn(
        'w-full items-center justify-center text-center',
        className,
        position === 1 && 'scale-100',
        position === 2 && 'lg:translate-x-2 lg:translate-y-4 lg:scale-90',
        position === 3 && 'lg:-translate-x-8 lg:translate-y-8 lg:scale-80'
      )}
    >
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
        <LightRays
          raysOrigin="top-center"
          raysColor={color}
          raysSpeed={0.2}
          lightSpread={3}
          rayLength={40}
          fadeDistance={5}
          followMouse={false}
          pulsating
          className="rotate-180"
        />
      </div>
      <CardContent className="flex flex-col items-center justify-center gap-6 py-4">
        <div className="relative flex size-36 flex-col items-center justify-center rounded-full border-1 border-white/10 bg-white/5 shadow-2xl shadow-white/10">
          <Avatar className="size-36">
            <AvatarImage src={data.image ?? undefined} />
            <AvatarFallback variant="initials" name={data.name ?? ''} />
          </Avatar>
          <div
            className={cn(
              'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-sm border-b-2 border-black/10 bg-accent px-3 py-0.5 text-accent-foreground backdrop-blur-2xl',
              `bg-[${color}]`
            )}
          >
            <span className="block text-xl font-bold">#{position}</span>
          </div>
        </div>
        <p>{data.name}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-left">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">{data.completedCount}</div>
            <div className="text-2xs opacity-60">
              {t('home:rank.achievements')}
              <br />
              {t('home:rank.completed')}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-center">
            <div className="text-3xl font-bold">{data.totalPoints}</div>
            <TicketIcon className="w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
