import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@toolshare/lib";

/**
 * Stack
 * ----------------------------------------------------------------------
 * Vertical flex layout with consistent gap. The default way to space
 * elements top-to-bottom without manually applying margins.
 */
const stackVariants = cva("flex flex-col", {
  variants: {
    gap: {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
      8: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
  },
  defaultVariants: {
    gap: 4,
    align: "start",
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export function Stack({ className, gap, align, ...props }: StackProps) {
  return (
    <div className={cn(stackVariants({ gap, align }), className)} {...props} />
  );
}
