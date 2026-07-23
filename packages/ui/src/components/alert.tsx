import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@toolshare/lib";

const alertVariants = cva(
  "flex gap-3 rounded-md border p-4 text-sm",
  {
    variants: {
      variant: {
        info: "bg-primary-50 border-primary-200 text-primary-800",
        success: "bg-success-50 border-success-100 text-success-600",
        warning: "bg-warning-50 border-warning-100 text-warning-600",
        danger: "bg-danger-50 border-danger-100 text-danger-600",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const icons: Record<string, React.ReactNode> = {
  info: (
    <path d="M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
  ),
  success: <path d="m9 12 2 2 4-4M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
  warning: (
    <path d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
  ),
  danger: <path d="M12 9v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string,
  variant?: "info" | "success" | "warning" | "danger";
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="size-5 shrink-0"
        aria-hidden="true"
      >
        {icons[variant ?? "info"]}
      </svg>
      <div className="space-y-1">
        {title && <p className="font-medium leading-none">{title}</p>}
        <div className="text-current/90">{children}</div>
      </div>
    </div>
  );
}
