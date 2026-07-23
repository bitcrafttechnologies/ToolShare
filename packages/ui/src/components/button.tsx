import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@toolshare/lib";

/**
 * Button
 * ----------------------------------------------------------------------
 * Core action component. Variants map only to token-derived utilities
 * (primary/secondary/etc. — never raw Tailwind palette colors) so the
 * whole system retheme via globals.css alone.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-600 active:bg-primary-700 shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-600 active:bg-secondary-700 shadow-sm",
        outline:
          "border border-border-strong bg-surface text-foreground hover:bg-surface-muted active:bg-stone-200",
        ghost:
          "bg-transparent text-foreground hover:bg-surface-muted active:bg-stone-200",
        destructive:
          "bg-danger text-danger-foreground hover:bg-danger-600 active:bg-danger-600 shadow-sm",
        link: "bg-transparent text-primary underline underline-offset-4 hover:text-primary-600 active:text-primary-700",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renders a left-aligned loading spinner and disables the button. */
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin size-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
