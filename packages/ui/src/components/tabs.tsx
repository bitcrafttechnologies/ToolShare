"use client";

import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * Tabs
 * ----------------------------------------------------------------------
 * Hand-rolled (no Radix). Implements the WAI-ARIA tabs pattern manually:
 * roving tabindex, arrow-key navigation between tabs, Home/End support,
 * and aria-selected/aria-controls wiring between TabsList and TabsPanel.
 *
 * Usage:
 *   <Tabs defaultValue="browse">
 *     <TabsList>
 *       <TabsTrigger value="browse">Browse</TabsTrigger>
 *       <TabsTrigger value="mine">My Tools</TabsTrigger>
 *     </TabsList>
 *     <TabsPanel value="browse">...</TabsPanel>
 *     <TabsPanel value="mine">...</TabsPanel>
 *   </Tabs>
 */
interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
}
const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* must be used within <Tabs>");
  return ctx;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = controlledValue ?? uncontrolled;
  const baseId = React.useId();

  const setValue = React.useCallback(
    (next: string) => {
      setUncontrolled(next);
      onValueChange?.(next);
    },
    [onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const listRef = React.useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    const list = listRef.current;
    if (!list) return;
    const tabs = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    );
    const currentIndex = tabs.findIndex(
      (t) => t === document.activeElement
    );
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      tabs[nextIndex]!.focus();
      tabs[nextIndex]!.click();
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm bg-surface-muted p-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, setValue, baseId } = useTabsContext();
  const isActive = value === activeValue;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setValue(value)}
      className={cn(
        "rounded-[0.4rem] px-3 py-1.5 text-sm font-medium transition-colors duration-150",
        isActive
          ? "bg-surface text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsPanel({
  value,
  className,
  children,
  ...props
}: TabsPanelProps) {
  const { value: activeValue, baseId } = useTabsContext();
  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={cn("mt-3 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
