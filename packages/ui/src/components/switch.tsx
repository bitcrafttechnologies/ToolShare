"use client";

import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * Switch
 * ----------------------------------------------------------------------
 * Hand-built toggle (no native HTML equivalent). Implemented as a
 * checkbox under the hood for free form-association and keyboard
 * support, visually styled as a track + thumb, with role="switch"
 * semantics layered on via the input's implicit role override.
 */
export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150",
          "has-[:checked]:bg-primary-500 bg-stone-300",
          "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none inline-block size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-150 peer-checked:translate-x-[1.375rem]"
        />
      </label>
    );
  }
);
Switch.displayName = "Switch";
