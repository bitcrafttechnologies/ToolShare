"use client";

import * as React from "react";

/**
 * useMounted
 * ----------------------------------------------------------------------
 * Returns true only after the component has mounted on the client.
 * Used by portal-rendering components (Dialog, Sheet, Toast) to defer
 * `createPortal` until `document.body` is guaranteed to exist, avoiding
 * an SSR mismatch. The setState-after-mount here is intentional and
 * unavoidable for this pattern — isolated to one hook so the exception
 * is documented in a single place rather than repeated per component.
 */
export function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: this is the standard client-mount-detection pattern, there is no alternative for deferring portal rendering until document.body exists.
    setMounted(true);
  }, []);
  return mounted;
}
