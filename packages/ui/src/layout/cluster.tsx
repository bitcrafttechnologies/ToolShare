import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@toolshare/lib";

/**
 * Cluster
 * ----------------------------------------------------------------------
 * Horizontal flex layout with consistent gap and wrapping — for rows of
 * badges, filter chips, button groups, or inline metadata (e.g. a
 * ToolCard's "rating · distance · price" line).
 */
const clusterVariants = cva("flex flex-wrap", {
  variants: {
    gap: {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
  },
  defaultVariants: {
    gap: 2,
    align: "center",
    justify: "start",
  },
});

export interface ClusterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof clusterVariants> {}

export function Cluster({
  className,
  gap,
  align,
  justify,
  ...props
}: ClusterProps) {
  return (
    <div
      className={cn(clusterVariants({ gap, align, justify }), className)}
      {...props}
    />
  );
}
