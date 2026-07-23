import * as React from "react";
import { cn } from "@toolshare/lib";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Shows a required-field indicator. */
  required?: boolean | undefined;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium text-foreground inline-flex items-center gap-1",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);
Label.displayName = "Label";
