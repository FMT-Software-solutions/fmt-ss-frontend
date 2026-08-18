import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';

const ALL = '__all__';

interface FilterSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  allLabel?: string;
  className?: string;
}

/**
 * Radix Select forbids an empty-string item value, so "no filter" travels as a
 * sentinel and is converted back to undefined for the query.
 */
export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  allLabel = 'All',
  className,
}: FilterSelectProps) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : next)}
    >
      <SelectTrigger className={className ?? 'w-40'}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
