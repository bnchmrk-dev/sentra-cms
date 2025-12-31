import { Combobox, type ComboboxOption } from "./Combobox";

// Common IANA timezone identifiers
const TIMEZONE_OPTIONS: ComboboxOption[] = [
  { value: "UTC", label: "UTC (+00:00)" },
  // Americas
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "America/Phoenix", label: "Arizona (No DST)" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Vancouver", label: "Vancouver" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Bogota", label: "Bogota" },
  { value: "America/Lima", label: "Lima" },
  { value: "America/Santiago", label: "Santiago" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "America/Buenos_Aires", label: "Buenos Aires" },
  // Europe
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Dublin", label: "Dublin" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Amsterdam", label: "Amsterdam" },
  { value: "Europe/Brussels", label: "Brussels" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/Rome", label: "Rome" },
  { value: "Europe/Zurich", label: "Zurich" },
  { value: "Europe/Stockholm", label: "Stockholm" },
  { value: "Europe/Oslo", label: "Oslo" },
  { value: "Europe/Copenhagen", label: "Copenhagen" },
  { value: "Europe/Helsinki", label: "Helsinki" },
  { value: "Europe/Warsaw", label: "Warsaw" },
  { value: "Europe/Prague", label: "Prague" },
  { value: "Europe/Vienna", label: "Vienna" },
  { value: "Europe/Athens", label: "Athens" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Europe/Istanbul", label: "Istanbul" },
  // Asia & Pacific
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Shanghai", label: "Shanghai / Beijing" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Seoul", label: "Seoul" },
  { value: "Asia/Bangkok", label: "Bangkok" },
  { value: "Asia/Jakarta", label: "Jakarta" },
  { value: "Asia/Manila", label: "Manila" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Australia/Melbourne", label: "Melbourne" },
  { value: "Australia/Brisbane", label: "Brisbane" },
  { value: "Australia/Perth", label: "Perth" },
  { value: "Pacific/Auckland", label: "Auckland" },
  { value: "Pacific/Fiji", label: "Fiji" },
  // Africa & Middle East
  { value: "Africa/Cairo", label: "Cairo" },
  { value: "Africa/Johannesburg", label: "Johannesburg" },
  { value: "Africa/Lagos", label: "Lagos" },
  { value: "Africa/Nairobi", label: "Nairobi" },
  { value: "Asia/Jerusalem", label: "Jerusalem" },
  { value: "Asia/Riyadh", label: "Riyadh" },
];

interface TimezoneSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function TimezoneSelect({
  label = "Timezone",
  value,
  onChange,
  disabled = false,
  error,
  className = "",
}: TimezoneSelectProps) {
  return (
    <Combobox
      label={label}
      options={TIMEZONE_OPTIONS}
      value={value}
      onChange={(val) => onChange(val || "UTC")}
      placeholder="Select timezone..."
      searchPlaceholder="Search timezones..."
      emptyMessage="No timezone found"
      allowClear={false}
      disabled={disabled}
      error={error}
      className={className}
    />
  );
}


