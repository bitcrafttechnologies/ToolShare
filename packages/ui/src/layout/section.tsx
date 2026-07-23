import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@toolshare/lib";

/**
 * Section
 * ----------------------------------------------------------------------
 * Vertical rhythm wrapper for a page region (e.g. "Nearby tools",
 * "Your activity"). Controls consistent vertical spacing between major
 * page blocks — distinct from Card, which is a visual surface.
 */
const sectionVariants = cva("", {
  variants: {
    spacing: {
      sm: "py-6",
      default: "py-10",
      lg: "py-16",
      none: "py-0",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: "section" | "div" | "article";
}

export function Section({
  className,
  spacing,
  as: Tag = "section",
  ...props
}: SectionProps) {
  return (
    <Tag className={cn(sectionVariants({ spacing }), className)} {...props} />
  );
}
