"use client";

import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * Menu
 * ----------------------------------------------------------------------
 * Hand-rolled dropdown menu (no Radix, no portal — positioned via
 * absolute + relative wrapper, fine for nav/avatar menus that don't
 * need to escape overflow containers). Closes on outside click,
 * Escape, or item selection. Arrow-key navigation between items.
 */
interface MenuContextValue {
  close: () => void;
}
const MenuContext = React.createContext<MenuContextValue | null>(null);

export interface MenuProps {
  trigger: React.ReactElement<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function Menu({ trigger, children, align = "start", className }: MenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (!menuRef.current) return;
      const items = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')
      );
      const currentIndex = items.findIndex((i) => i === document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(currentIndex + 1) % items.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    // Focus first item on open
    const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const triggerEl = React.cloneElement(trigger, {
    "aria-haspopup": "menu",
    "aria-expanded": open,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      setOpen((o) => !o);
      trigger.props.onClick?.(e);
    },
  } as Partial<typeof trigger.props>);

  return (
    <MenuContext.Provider value={{ close }}>
      <div ref={rootRef} className="relative inline-block">
        {triggerEl}
        {open && (
          <div
            ref={menuRef}
            role="menu"
            className={cn(
              "absolute z-50 mt-2 min-w-[12rem] rounded-md border border-border bg-surface p-1 shadow-md",
              align === "end" ? "right-0" : "left-0",
              className
            )}
          >
            {children}
          </div>
        )}
      </div>
    </MenuContext.Provider>
  );
}

export interface MenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function MenuItem({ className, destructive, onClick, ...props }: MenuItemProps) {
  const ctx = React.useContext(MenuContext);

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={(e) => {
        onClick?.(e);
        ctx?.close();
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-[0.4rem] px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:bg-surface-muted",
        destructive ? "text-danger-600" : "text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}
