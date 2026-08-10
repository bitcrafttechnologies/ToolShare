import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * TabBar
 * ----------------------------------------------------------------------
 * Bottom navigation for mobile viewports/app shell. Pairs with
 * <Navbar> for web — show one or the other via responsive classes
 * (e.g. wrap with `md:hidden`). Respects safe-area-inset-bottom for
 * devices with a home indicator.
 */
export interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function TabBar({ className, children, ...props }: TabBarProps) {
  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-6xl items-stretch justify-around">
        {children}
      </div>
    </nav>
  );
}

export interface TabBarItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  /** Shows a small dot/number badge (e.g. unread requests). */
  badge?: React.ReactNode;
  /**
   * Render as a different element while keeping the tab styling — pass a
   * router link (e.g. next/link) so tab navigation stays client-side instead
   * of doing a full page load. Defaults to a plain anchor.
   */
  as?: React.ElementType;
}

export function TabBarItem({
  className,
  icon,
  label,
  active,
  badge,
  as: Comp = "a",
  ...props
}: TabBarItemProps) {
  return (
    <Comp
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors duration-150 [&_svg]:size-6",
        active ? "text-primary-600" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      <span className="relative">
        {icon}
        {badge && (
          <span className="absolute -right-1.5 -top-1.5">{badge}</span>
        )}
      </span>
      {label}
    </Comp>
  );
}
