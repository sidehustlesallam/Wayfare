import type { SelectHTMLAttributes } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: DropdownOption[];
}

export function Dropdown({
  label,
  options,
  className = '',
  id,
  ...rest
}: DropdownProps) {
  const selectId = id ?? `dropdown-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`} htmlFor={selectId}>
      <span className="font-medium text-wayfare-slate">{label}</span>
      <select
        id={selectId}
        className="rounded-md border border-wayfare-mist bg-white px-3 py-2 text-wayfare-ink shadow-sm focus:border-wayfare-sky focus:outline-none focus:ring-2 focus:ring-wayfare-sky/30"
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
