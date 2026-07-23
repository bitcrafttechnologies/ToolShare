import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@toolshare/lib";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted text-muted-foreground font-medium",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        default: "size-10 text-sm",
        lg: "size-14 text-base",
        xl: "size-20 text-xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  // `| undefined` on every optional prop: the repo sets
  // exactOptionalPropertyTypes, so callers passing a possibly-undefined
  // value (`src={profile.avatar_url ?? undefined}`) would otherwise fail.
  src?: string | undefined;
  /** Full name, used to derive initials fallback and for alt text. */
  name: string;
  /** Shows a small verified badge in the corner. */
  verified?: boolean | undefined;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function Avatar({
  className,
  size,
  src,
  name = "Unknown",
  verified,
  ...props
}: AvatarProps) {
  return (
    <span className={cn(avatarVariants({ size }), className)} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
      {src && <span className="sr-only">{name}</span>}
      {verified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex size-[42%] min-h-[15px] min-w-[15px] items-center justify-center rounded-full bg-gold ring-[2.5px] ring-surface"
          title="Verified"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            className="size-[60%] text-gold-foreground"
            aria-hidden="true"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
          <span className="sr-only">Verified</span>
        </span>
      )}
    </span>
  );
}
