import * as React from "react";
import { cn } from "@toolshare/lib";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-sm border border-border-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-danger-400 aria-invalid:focus-visible:ring-danger-400",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
