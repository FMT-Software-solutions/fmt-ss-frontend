import { TriangleAlert } from 'lucide-react';
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@repo/ui';
import type { ProductApp } from '@/types/orgs';

interface AppSwitcherProps {
  apps: ProductApp[] | undefined;
  value: string | undefined;
  onChange: (appId: string) => void;
  loading?: boolean;
  label?: string;
}

/**
 * Chooses which product app a page is scoped to. A dropdown rather than a
 * button row so the control stays the same size as the number of apps grows.
 */
export function AppSwitcher({ apps, value, onChange, loading, label = 'App' }: AppSwitcherProps) {
  if (loading) return <Skeleton className="h-10 w-56" />;

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="app-switcher" className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="app-switcher" className="w-56">
          <SelectValue placeholder="Select an app" />
        </SelectTrigger>
        <SelectContent>
          {apps?.map((app) => (
            <SelectItem key={app.id} value={app.id}>
              <span className="flex items-center gap-2">
                {app.name}
                {!app.configured && <TriangleAlert className="size-3.5 text-amber-500" />}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
