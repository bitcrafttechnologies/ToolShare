"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@toolshare/lib";
import { useFocusTrap } from "./use-focus-trap";
import { useMounted } from "./use-mounted";
import { IconButton } from "./icon-button";

/**
 * Sheet
 * ----------------------------------------------------------------------
 * Bottom-anchored panel — the mobile-native equivalent of Dialog, used
 * for the request-to-borrow flow, filters, and quick actions. Slides up
 * from the bottom on mobile; on wider (`side="right"`) contexts can act
 * as a side drawer for web.
 */
export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  side?: "bottom" | "right";
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "bottom",
  className,
}: SheetProps) {
  const containerRef = useFocusTrap(open, onClose);
  const mounted = useMounted();

  if (!mounted || !open) return null;

  const titleId = "sheet-title";
  const descId = "sheet-description";

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
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
          "relative bg-surface shadow-lg outline-none flex flex-col",
          side === "bottom" &&
            "mt-auto w-full max-h-[88vh] rounded-t-lg animate-[sheet-up_200ms_ease-out]",
          side === "right" &&
            "ml-auto h-full w-full max-w-sm animate-[sheet-in_200ms_ease-out]",
          className
        )}
      >
        {side === "bottom" && (
          <div
            aria-hidden="true"
            className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-border-strong"
          />
        )}
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
            label="Close"
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
          <div className="flex items-center justify-end gap-3 border-t border-border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
