import { Badge } from "./badge";

/**
 * BookingStatusBadge
 * ----------------------------------------------------------------------
 * Maps the `booking_status` enum to a Badge tone. Distinct from
 * StatusBadge, which covers *tool* availability
 * (available/borrowed/pending/overdue) — the two enums look similar but
 * mean different things, and conflating them was the mistake worth
 * avoiding here.
 *
 * Keys mirror the Postgres `booking_status` type exactly; the labels
 * mirror BOOKING_STATUS_LABELS in @toolshare/types. Kept as a local
 * literal union so this package doesn't take a runtime dependency on
 * the types package for a value it only needs at the type level.
 */
export type BookingStatusValue =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "disputed";

const statusConfig: Record<
  BookingStatusValue,
  { label: string; variant: "neutral" | "primary" | "success" | "warning" | "danger" }
> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "primary" },
  active: { label: "Active", variant: "success" },
  completed: { label: "Completed", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "neutral" },
  disputed: { label: "Disputed", variant: "danger" },
};

export interface BookingStatusBadgeProps {
  status: BookingStatusValue;
  className?: string | undefined;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
