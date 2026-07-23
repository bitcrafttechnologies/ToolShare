"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@toolshare/lib";
import { useFocusTrap } from "./use-focus-trap";
import { useMounted } from "./use-mounted";
import { IconButton } from "./icon-button";

/**
 * Dialog
 * ----------------------------------------------------------------------
 * Hand-rolled modal (no Radix). Renders via a portal to escape any
 * clipping ancestor, traps focus and closes on Escape via useFocusTrap,
 * and closes on backdrop click. Centered on web; on mobile, prefer
 * <Sheet> for a bottom-anchored equivalent.
 */
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  // `| undefined` throughout: the repo sets exactOptionalPropertyTypes, so
  // an optional prop must accept an explicit undefined to be handed one
  // (e.g. `description={selected ? text : undefined}`).
  description?: string | undefined;
  children?: React.ReactNode | undefined;
  footer?: React.ReactNode | undefined;
  className?: string | undefined;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const containerRef = useFocusTrap(open, onClose);
  const mounted = useMounted();

  if (!mounted || !open) return null;

  const titleId = "dialog-title";
  const descId = "dialog-description";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-md rounded-lg bg-surface shadow-lg outline-none",
          "max-h-[85vh] flex flex-col",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-3">
          <div>
            <h2 id={titleId} className="font-heading text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <IconButton
            label="Close dialog"
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="-mt-1 -mr-1"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border p-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
