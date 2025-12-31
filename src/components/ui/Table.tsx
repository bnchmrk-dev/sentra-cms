import type { ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// Table Container
interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full">{children}</table>
    </div>
  );
}

// Table Header
interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="border-b border-border-default">
      <tr>{children}</tr>
    </thead>
  );
}

// Table Header Cell with optional sorting
interface TableHeadProps {
  children: ReactNode;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  align?: "left" | "center" | "right";
  className?: string;
}

export function TableHead({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  align = "left",
  className = "",
}: TableHeadProps) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <th
      className={`
        px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider
        ${alignClass}
        ${sortable ? "cursor-pointer select-none hover:text-text-secondary" : ""}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span className="text-text-muted">
            {sortDirection === "asc" ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : sortDirection === "desc" ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
            )}
          </span>
        )}
      </span>
    </th>
  );
}

// Table Body
interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-border-subtle">{children}</tbody>;
}

// Table Row
interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function TableRow({
  children,
  onClick,
  selected = false,
  className = "",
}: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        transition-colors
        ${onClick ? "cursor-pointer" : ""}
        ${selected ? "bg-accent-subtle" : "hover:bg-bg-hover/50"}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

// Table Cell
interface TableCellProps {
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export function TableCell({
  children,
  align = "left",
  className = "",
}: TableCellProps) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <td className={`px-4 py-3 text-sm ${alignClass} ${className}`}>
      {children}
    </td>
  );
}

// Checkbox Cell (for selection)
interface TableCheckboxCellProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function TableCheckboxCell({
  checked,
  onChange,
  className = "",
}: TableCheckboxCellProps) {
  return (
    <td className={`px-4 py-3 w-12 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-2 border-border-default bg-bg-input
                   checked:bg-accent checked:border-accent
                   focus:ring-2 focus:ring-accent/50 focus:ring-offset-0
                   cursor-pointer transition-colors"
      />
    </td>
  );
}

