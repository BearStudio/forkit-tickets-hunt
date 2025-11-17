import { Link } from '@tanstack/react-router';
import { CheckIcon, ExternalLinkIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { TicketIcon } from '@/components/ui/ticket-icon';

import { Achievement } from '@/features/achievement/schema';

export const AchievementItem = (props: {
  achievement: Achievement & { secretId?: string | null };
  completed?: boolean;
}) => {
  const { t } = useTranslation(['achievement']);
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 text-foreground shadow-2xl backdrop-blur-xl',
        props.completed &&
          'bg-white/10 bg-gradient-to-br from-white/5 to-accent/10'
      )}
    >
      <div className="relative flex items-center gap-3 p-2">
        {props.completed && (
          <div className="absolute top-1.5 left-1.5 flex size-4 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <CheckIcon className="size-3" />
          </div>
        )}
        <div
          className={cn(
            'flex aspect-square size-12 items-center justify-center overflow-hidden rounded-md border border-foreground/10 bg-white/5 text-foreground'
          )}
        >
          <div className={cn(!props.completed && 'opacity-80 grayscale')}>
            {props.achievement.imageUrl && (
              <img
                src={props.achievement.imageUrl}
                alt=""
                className="size-full object-cover"
              />
            )}
            {!props.achievement.imageUrl && props.achievement.emoji && (
              <span className="text-lg">{props.achievement.emoji}</span>
            )}
            {!props.achievement.imageUrl && !props.achievement.emoji && (
              <TrophyIcon className="size-6 text-accent" />
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1 py-1 text-sm leading-tight">
          <p className="font-bold">{props.achievement.name}</p>
        </div>
        <div className="flex items-center justify-center px-2">
          <span
            className={cn(
              'flex flex-col items-center text-xs',
              !props.completed && 'opacity-60'
            )}
          >
            +{props.achievement.points || '???'}
            <TicketIcon
              className={cn('w-8', !props.completed && 'opacity-60 grayscale')}
            />
          </span>
        </div>
      </div>
      {!props.completed &&
        (!!props.achievement.hint ||
          props.achievement.type === 'GITHUB_STAR') &&
        !props.achievement.secretId && (
          <div className="flex flex-1 items-center gap-3 border-t border-t-white/10 bg-white/2 px-3 py-2">
            <p className="flex-1 text-xs opacity-60">
              {props.achievement.hint}
            </p>
            {props.achievement.type === 'GITHUB_STAR' &&
              !!props.achievement.key && (
                <Button size="xs" variant="ghost" asChild>
                  <a
                    href={`https://github.com/${props.achievement.key}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {t('achievement:app.githubStar.viewRepo')}
                    <ExternalLinkIcon />
                  </a>
                </Button>
              )}
          </div>
        )}

      {!props.completed &&
        props.achievement.type === 'GITHUB_STAR' &&
        props.achievement.secretId && (
          <div className="flex flex-1 flex-col items-center gap-1 border-t border-t-white/10 bg-white/2 px-3 py-2">
            <p className="flex-1 text-2xs opacity-60">
              {t('achievement:app.githubStar.youStarred')}
            </p>
            <Button size="lg" variant="secondary" className="w-full" asChild>
              <Link
                to="/app/achievements/complete"
                search={{ id: props.achievement.secretId }}
              >
                {t('achievement:app.githubStar.claim', {
                  points: props.achievement.points,
                })}{' '}
                <TicketIcon />
              </Link>
            </Button>
          </div>
        )}
    </div>
  );
};
