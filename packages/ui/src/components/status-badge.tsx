import { Badge } from "./badge";

/**
 * StatusBadge
 * ----------------------------------------------------------------------
 * Maps ToolShare's closed set of lending statuses to the right Badge
 * variant + label, so status colors stay consistent everywhere they
 * appear (ToolCard, requests inbox, activity history) rather than each
 * call site picking its own Badge variant.
 */
export type ToolStatus = "available" | "borrowed" | "pending" | "overdue";

const statusConfig: Record<
  ToolStatus,
  { label: string; variant: "success" | "neutral" | "warning" | "danger" }
> = {
  available: { label: "Available", variant: "success" },
  borrowed: { label: "Borrowed", variant: "neutral" },
  pending: { label: "Pending", variant: "warning" },
  overdue: { label: "Overdue", variant: "danger" },
};

export interface StatusBadgeProps {
  status: ToolStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

/**
 * VerifiedBadge
 * ----------------------------------------------------------------------
 * Separate from StatusBadge since "verified" describes the owner/listing
 * trust level, not the tool's current availability — the two can appear
 * together on a ToolCard.
 */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="gold" className={className}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        className="size-3"
        aria-hidden="true"
      >
        <path d="m5 13 4 4L19 7" />
      </svg>
      Verified
    </Badge>
  );
}
