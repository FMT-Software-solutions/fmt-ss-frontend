import { Badge, cn } from '@repo/ui';

// Status vocabularies differ per table (purchases, reviews, quotes, orgs), so
// map by meaning rather than enumerating every table's values.
const TONES: Record<string, string> = {
  positive: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warning: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  negative: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
  neutral: 'border-transparent bg-muted text-muted-foreground',
  info: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400',
};

const STATUS_TONES: Record<string, keyof typeof TONES> = {
  active: 'positive',
  approved: 'positive',
  completed: 'positive',
  success: 'positive',
  sent: 'positive',
  confirmed: 'positive',
  resolved: 'positive',

  pending: 'warning',
  unread: 'warning',
  trial: 'warning',
  requested: 'warning',
  reviewing: 'warning',
  'pending-customer-feedback': 'warning',

  failed: 'negative',
  rejected: 'negative',
  cancelled: 'negative',
  expired: 'negative',
  inactive: 'negative',
  open: 'negative',

  read: 'neutral',
  archived: 'neutral',
};

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const tone = STATUS_TONES[status.toLowerCase()] ?? 'info';

  return (
    <Badge variant="outline" className={cn('capitalize', TONES[tone], className)}>
      {status.replace(/[-_]/g, ' ')}
    </Badge>
  );
}
