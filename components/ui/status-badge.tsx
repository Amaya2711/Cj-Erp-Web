import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700",
      )}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}
