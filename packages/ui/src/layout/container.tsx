
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@toolshare/lib";

/**
 * Container
 * ----------------------------------------------------------------------
 * Centers content horizontally with a max-width and consistent side
 * padding. The top-level wrapper for nearly every page/screen.
 */
const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-2xl",
      default: "max-w-5xl",
      lg: "max-w-6xl",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export function Container({ className, size, ...props }: ContainerProps) {
  return (
    <div className={cn(containerVariants({ size }), className)} {...props} />
  );
}
