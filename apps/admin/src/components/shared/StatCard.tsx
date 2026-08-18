import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, Skeleton, cn } from '@repo/ui';

interface StatCardProps {
  label: string;
  value?: string | number;
  hint?: string;
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  loading,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="truncate text-2xl font-semibold tabular-nums">{value ?? '—'}</p>
          )}
          {hint && !loading && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {Icon && (
          <div className={cn('rounded-md bg-muted p-2 text-muted-foreground')}>
            <Icon className="size-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
