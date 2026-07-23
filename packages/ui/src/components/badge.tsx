import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@toolshare/lib";

/**
 * Badge
 * ----------------------------------------------------------------------
 * Generic label/pill. `variant` covers semantic + neutral tones; for the
 * closed set of tool-category colors, use CategoryTag (components/domain)
 * which wraps this with category-specific styling instead of open props.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-muted text-foreground",
        primary: "bg-primary-100 text-primary-700",
        secondary: "bg-secondary-100 text-secondary-700",
        success: "bg-success-100 text-success-600",
        warning: "bg-warning-100 text-warning-600",
        danger: "bg-danger-100 text-danger-600",
        gold: "bg-gold-100 text-gold-600",
        outline: "border border-border-strong text-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  variant?:
    | "neutral"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "gold"
    | "outline";
    }

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
