import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-strong focus-visible:ring-ring",
  secondary:
    "bg-surface-strong text-foreground hover:bg-border focus-visible:ring-ring",
  danger: "bg-danger text-white hover:brightness-95 focus-visible:ring-red-300",
  ghost: "bg-transparent text-foreground hover:bg-surface-strong focus-visible:ring-ring",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", fullWidth = false, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSNAMES[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
});
