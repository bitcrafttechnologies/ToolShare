import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * Navbar
 * ----------------------------------------------------------------------
 * Top navigation for web/wide viewports. Hidden in favor of <TabBar> on
 * small screens — compose both in the root layout and toggle visibility
 * with responsive classes (this component assumes `hidden md:flex`
 * applied by the consumer, or wrap it that way directly).
 */
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  /** Center nav links/content. */
  children?: React.ReactNode;
  /** Right-aligned actions (search, avatar menu, "List a tool" button). */
  actions?: React.ReactNode;
}

export function Navbar({ className, logo, children, actions, ...props }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {logo && <div className="flex shrink-0 items-center">{logo}</div>}
        <nav className="flex flex-1 items-center gap-1">{children}</nav>
        {actions && (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    </header>
  );
}

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

export function NavLink({ className, active, ...props }: NavLinkProps) {
  return (
    <a
      className={cn(
        "rounded-sm px-3 py-2 text-sm font-medium transition-colors duration-150",
        active
          ? "text-primary-600"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-current={active ? "page" : undefined}
      {...props}
    />
  );
}
