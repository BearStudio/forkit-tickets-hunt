import { cn } from '@/lib/tailwind/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <span
      data-slot="skeleton"
      className={cn(
        'block max-w-full animate-pulse rounded-xs bg-white/10 backdrop-blur-xl',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
