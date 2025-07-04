export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.FC<IconProps>;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// components/Button/Button.tsx
import React from "react";
import { Spinner } from "./Spinner";
import { IconProps } from "@/icons/Send";

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon: Icon,
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  className = "",
  children,
  ...props
}) => {
  // Variant styles
  const variants = {
    primary:
      "bg-control-cta hover:bg-control-ctaHover active:bg-control-cta focus-visible:ring-control-default-900/20 text-text-dark",
    secondary:
      "bg-control-secondary text-text-dark border-border-default border hover:bg-control-secondaryHover active:bg-control-secondary focus-visible:ring-control-secondary/10",
  };

  // Size styles
  const sizes = {
    sm: "px-8 py-1 text-caption",
    md: "px-8 py-2 text-base",
    lg: "px-8 py-2 text-[1.25rem]",
  };

  // Icon sizes based on button size
  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  } as const;

  // Spinner sizes
  const spinnerSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  } as const;

  const baseClasses = [
    // Base styles
    "inline-flex items-center justify-center gap-2",
    "rounded-xl",
    "transition-colors duration-100",
    "focus:outline-none focus-visible:ring-4",
    // Touch behavior for mobile
    "touch-manipulation",
    // Disabled state
    "disabled:bg-control-disabled disabled:text-text-placeholder disabled:cursor-not-allowed",
    // Width
    fullWidth ? "w-full" : "",
    // Variant and size specific styles
    variants[variant],
    sizes[size],
    // Additional classes
    className,
  ].join(" ");

  return (
    <button
      className={baseClasses}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner className={spinnerSizes[size]} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={iconSizes[size] as number} />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
