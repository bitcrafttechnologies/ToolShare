import { cn } from "@toolshare/lib";

/**
 * Spacer
 * ----------------------------------------------------------------------
 * Flexible filler for flex rows — e.g. pushing an action to the end of
 * a Cluster without using justify-between. Renders as an empty,
 * aria-hidden div with flex-grow.
 */
export function Spacer({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("flex-1", className)} />;
}
