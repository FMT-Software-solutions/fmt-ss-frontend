interface Swatch {
  path: string;
  label: string;
  color: string;
}

const COLOR_PATTERN = /^(#[0-9a-f]{3,8}|oklch\(|rgba?\(|hsla?\(|lab\(|lch\()/i;

/**
 * brand_colors has two shapes across the products: print-calc-pro stores a
 * flat light/dark map of hex values, while stock-flow and church-hub store a
 * full theme object that also carries fonts, radii and shadows. Rather than
 * branching on app, walk the object and surface anything that parses as a
 * colour.
 */
function collectSwatches(value: unknown, path: string[] = [], out: Swatch[] = []): Swatch[] {
  if (out.length >= 24) return out;

  if (typeof value === 'string') {
    if (COLOR_PATTERN.test(value.trim())) {
      out.push({
        path: path.join('.'),
        label: path[path.length - 1] ?? 'color',
        color: value.trim(),
      });
    }
    return out;
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      collectSwatches(child, [...path, key], out);
    }
  }

  return out;
}

export function BrandColorsPreview({ value }: { value: unknown }) {
  const swatches = collectSwatches(value);

  if (!swatches.length) {
    return <p className="text-sm text-muted-foreground">No brand colours recorded.</p>;
  }

  const groups = swatches.reduce<Record<string, Swatch[]>>((acc, swatch) => {
    const group = swatch.path.split('.').slice(0, -1).join('.') || 'colors';
    (acc[group] ??= []).push(swatch);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="space-y-1.5">
          <p className="text-xs capitalize text-muted-foreground">{group.replace(/\./g, ' › ')}</p>
          <div className="flex flex-wrap gap-2">
            {items.map((swatch) => (
              <div key={swatch.path} className="flex items-center gap-1.5">
                <span
                  className="size-6 rounded border"
                  style={{ backgroundColor: swatch.color }}
                  title={`${swatch.label}: ${swatch.color}`}
                />
                <span className="text-xs capitalize text-muted-foreground">
                  {swatch.label.replace(/[-_]/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
