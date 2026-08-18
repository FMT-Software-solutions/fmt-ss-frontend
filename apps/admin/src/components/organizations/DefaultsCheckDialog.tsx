import { CheckCircle2, Loader2, TriangleAlert, Wrench } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@repo/ui';
import { useApplyDefaults, useDefaultsCheck } from '@/hooks/queries/use-defaults';
import { TEMPLATE_LABELS, type DefaultsDifference } from '@/types/defaults';

interface DefaultsCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: string | undefined;
  orgId: string | undefined;
  organizationName?: string | null;
}

function preview(value: unknown): string {
  if (value === null || value === undefined) return 'not set';
  if (typeof value === 'string') return value.length > 60 ? `${value.slice(0, 60)}…` : value;
  const json = JSON.stringify(value);
  return json.length > 80 ? `${json.slice(0, 80)}…` : json;
}

function Difference({ difference }: { difference: DefaultsDifference }) {
  return (
    <div className="rounded-md border p-2 text-xs">
      <p className="font-mono font-medium">{difference.field}</p>
      <p className="mt-1 text-muted-foreground">
        current: <span className="text-destructive">{preview(difference.current)}</span>
      </p>
      <p className="text-muted-foreground">
        expected: <span className="text-emerald-600">{preview(difference.expected)}</span>
      </p>
    </div>
  );
}

export function DefaultsCheckDialog({
  open,
  onOpenChange,
  appId,
  orgId,
  organizationName,
}: DefaultsCheckDialogProps) {
  const { data, isLoading, refetch } = useDefaultsCheck(open ? appId : undefined, open ? orgId : undefined);
  const apply = useApplyDefaults(appId, orgId);

  const driftedKinds = (data?.checks ?? []).filter((check) => !check.inSync);

  return (
    <Dialog open={open} onOpenChange={(next) => !apply.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Default data check</DialogTitle>
          <DialogDescription>
            Compares {organizationName ?? 'this organization'} against the current templates for
            this app. Nothing changes until you apply.
          </DialogDescription>
        </DialogHeader>

        {isLoading && <Skeleton className="h-32 w-full" />}

        {data?.unavailable && (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            The templates table is missing. Run
            <code className="mx-1 font-mono text-xs">
              supabase_migrations/20260817_app_default_templates.sql
            </code>
            in the main project.
          </p>
        )}

        {data && !data.unavailable && data.checks.length === 0 && (
          <p className="rounded-md border p-3 text-sm text-muted-foreground">
            No default templates are configured for this app yet. Set them up under Defaults.
          </p>
        )}

        {data && !data.unavailable && data.checks.length > 0 && (
          <div className="space-y-3">
            {data.checks.map((check) => (
              <div key={check.kind} className="space-y-2">
                <div className="flex items-center gap-2">
                  {check.inSync ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <TriangleAlert className="size-4 text-amber-600" />
                  )}
                  <p className="font-medium">{TEMPLATE_LABELS[check.kind]}</p>
                  <Badge variant="outline">
                    {check.inSync ? 'Matches' : `${check.differences.length} difference(s)`}
                  </Badge>
                </div>
                {!check.inSync && (
                  <div className="space-y-1.5 pl-6">
                    {check.differences.map((difference) => (
                      <Difference key={difference.field} difference={difference} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={apply.isPending}>
            Close
          </Button>
          <Button
            disabled={apply.isPending || driftedKinds.length === 0}
            onClick={() =>
              apply.mutate(
                { kinds: driftedKinds.map((check) => check.kind) },
                { onSuccess: () => void refetch() },
              )
            }
          >
            {apply.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wrench className="size-4" />
            )}
            {driftedKinds.length === 0
              ? 'Nothing to fix'
              : `Apply ${driftedKinds.length} template(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
