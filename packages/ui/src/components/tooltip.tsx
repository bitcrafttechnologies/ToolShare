"use client";

import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * Tooltip
 * ----------------------------------------------------------------------
 * Hand-rolled (no Radix). Shows on hover or keyboard focus of its single
 * child trigger, hides on blur/mouseleave/Escape. Uses aria-describedby
 * rather than a live region, matching native title-attribute semantics.
 */
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >;
  side?: "top" | "bottom";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  function show() {
    setOpen(true);
  }
  function hide() {
    setOpen(false);
  }

  const trigger = React.cloneElement(children, {
    "aria-describedby": id,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      show();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hide();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      show();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hide();
      children.props.onBlur?.(e);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape") hide();
      children.props.onKeyDown?.(e);
    },
  } as Partial<typeof children.props>);

  return (
    <span className="relative inline-flex">
      {trigger}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-[0.4rem] bg-stone-900 px-2.5 py-1 text-xs font-medium text-stone-50 shadow-md",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
