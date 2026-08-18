import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Loader2, Save, TriangleAlert } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { AppSwitcher } from '@/components/shared/AppSwitcher';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAppRegistry, useAppOrganizations } from '@/hooks/queries/use-organizations';
import {
  useCaptureTemplate,
  useDefaultTemplates,
  useSaveTemplate,
} from '@/hooks/queries/use-defaults';
import { formatDateTime } from '@/lib/format';
import {
  TEMPLATE_DESCRIPTIONS,
  TEMPLATE_LABELS,
  type TemplateKind,
} from '@/types/defaults';

const ALL_KINDS: TemplateKind[] = [
  'branding',
  'roles',
  'organization_settings',
  'services',
];

export function DefaultsPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { data: registry, isLoading: registryLoading } = useAppRegistry();

  useEffect(() => {
    if (!appId && registry?.length) {
      const first = registry.find((app) => app.configured) ?? registry[0];
      navigate(`/defaults/${first.id}`, { replace: true });
    }
  }, [appId, registry, navigate]);

  const activeApp = registry?.find((app) => app.id === appId);
  // Only offer templates the app's schema can actually hold.
  const kinds = ALL_KINDS.filter((kind) => {
    if (kind === 'roles') return Boolean(activeApp?.capabilities.hasDynamicRoles);
    if (kind === 'services') return Boolean(activeApp?.capabilities.hasServiceCatalog);
    return true;
  });

  return (
    <>
      <PageHeader
        title="Defaults"
        description="What every newly provisioned organization should start with."
        actions={
          <AppSwitcher
            apps={registry}
            value={appId}
            loading={registryLoading}
            onChange={(next) => navigate(`/defaults/${next}`)}
          />
        }
      />

      <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-base">Why this exists</CardTitle>
          <CardDescription>
            Each app's provisioning edge function and seed triggers carry their own hardcoded
            defaults, which drift from what the app actually expects. The templates here are
            applied over every organization this console provisions, and can be re-applied to
            repair an existing organization from its page.
          </CardDescription>
        </CardHeader>
      </Card>

      {activeApp && !activeApp.configured ? (
        <Card>
          <EmptyState
            icon={TriangleAlert}
            title={`${activeApp.name} is not connected`}
            description="Without Supabase credentials its defaults cannot be captured or applied."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {kinds.map((kind) => (
            <TemplateEditor key={kind} appId={appId} kind={kind} />
          ))}
        </div>
      )}
    </>
  );
}

function TemplateEditor({ appId, kind }: { appId: string | undefined; kind: TemplateKind }) {
  const { data, isLoading } = useDefaultTemplates(appId);
  const save = useSaveTemplate(appId);
  const capture = useCaptureTemplate(appId);
  const { data: organizations } = useAppOrganizations(appId, { page: 1, limit: 100 });

  const template = data?.templates.find((entry) => entry.kind === kind);
  const [draft, setDraft] = useState('');
  const [captureOrgId, setCaptureOrgId] = useState<string | undefined>();
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setDraft(JSON.stringify(template?.payload ?? {}, null, 2));
    }
  }, [template, dirty]);

  const parsed = (() => {
    try {
      const value = JSON.parse(draft || '{}');
      return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? { ok: true as const, value: value as Record<string, unknown> }
        : { ok: false as const, error: 'Must be a JSON object' };
    } catch (error) {
      return { ok: false as const, error: (error as Error).message };
    }
  })();

  if (data?.unavailable) {
    return (
      <Card>
        <EmptyState
          icon={TriangleAlert}
          title="Templates table missing"
          description="Run supabase_migrations/20260817_app_default_templates.sql in the main project."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{TEMPLATE_LABELS[kind]}</CardTitle>
            <CardDescription>{TEMPLATE_DESCRIPTIONS[kind]}</CardDescription>
          </div>
          {template ? (
            <Badge variant="outline" className="border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              Configured
            </Badge>
          ) : (
            <Badge variant="outline">Not set</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Capture from an existing organization
                </Label>
                <Select value={captureOrgId} onValueChange={setCaptureOrgId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pick a known-good organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {(organizations?.data ?? []).map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name ?? org.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                disabled={!captureOrgId || capture.isPending}
                onClick={() =>
                  capture.mutate(
                    { kind, organizationId: captureOrgId! },
                    {
                      onSuccess: (payload) => {
                        setDraft(JSON.stringify(payload, null, 2));
                        setDirty(true);
                      },
                    },
                  )
                }
              >
                {capture.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Capture
              </Button>
            </div>

            <Textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setDirty(true);
              }}
              rows={12}
              spellCheck={false}
              className="font-mono text-xs"
            />

            {!parsed.ok && <p className="text-sm text-destructive">{parsed.error}</p>}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {template
                  ? `Last updated ${formatDateTime(template.updated_at)}${template.updated_by ? ` by ${template.updated_by}` : ''}`
                  : 'No template saved yet.'}
              </p>
              <Button
                disabled={!parsed.ok || save.isPending}
                onClick={() =>
                  parsed.ok &&
                  save.mutate(
                    { kind, payload: parsed.value },
                    { onSuccess: () => setDirty(false) },
                  )
                }
              >
                {save.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save template
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
