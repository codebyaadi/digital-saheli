import type { IconWeight } from "@phosphor-icons/react";

/** Prop type shared by every Phosphor icon, so components can accept any icon. */
export type IconType = React.ComponentType<{
  size?: number;
  weight?: IconWeight;
  className?: string;
  "aria-label"?: string;
}>;