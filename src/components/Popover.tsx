"use client";
import * as RadixPopover from "@radix-ui/react-popover";
import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type PopoverOption = {
  id: string;
  item: string | ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export interface PopoverProps {
  /* Optional title for the options list */
  children?: ReactNode;
  trigger: ReactNode;
  options?: PopoverOption[];
  title?: string | ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  width?: "auto" | "trigger" | "sm" | "md" | "lg";
  showArrow?: boolean;
  padding?: boolean;
  shadow?: boolean;
  border?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  options,
  title,
  open,
  onOpenChange,
  align = "center",
  side = "bottom",
  className = "",
  width = "auto",
  showArrow = true,
  padding = true,
  shadow = true,
  border = true,
}) => {
  // Internal state for controlled/uncontrolled behavior
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  // Width classes mapping
  const widthClasses = {
    auto: "w-auto",
    trigger: "w-[var(--radix-popover-trigger-width)]",
    sm: "w-64",
    md: "w-80",
    lg: "w-96",
  };

  // Content container styles
  const contentBaseClasses = [
    "z-50 origin-[var(--radix-popover-content-transform-origin)]",
    "bg-bg-white backdrop-blur-md",
    "rounded-xl",
    "outline-none",
    padding ? "p-small" : "",
    shadow ? "shadow-lg" : "",
    border ? "border border-border-default" : "",
    widthClasses[width],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Generate options content if options array is provided
  const renderOptionsContent = () => {
    if (!options || options.length === 0) return null;

    const itemBaseClasses = ["focus:ring-slate-200"].join(" ");
    return (
      <>
        {title && <PopoverHeading>{title}</PopoverHeading>}
        {options.map((option) => (
          <PopoverItem
            key={option.id}
            onClick={() => {
              if (!option.disabled) {
                option.onClick();
                handleOpenChange(false);
              }
            }}
            disabled={option.disabled}
            className={itemBaseClasses + " " + (option.className || "")}
          >
            {typeof option.item === "string" ? (
              <span>{option.item}</span>
            ) : (
              option.item
            )}
          </PopoverItem>
        ))}
      </>
    );
  };

  return (
    <RadixPopover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <RadixPopover.Trigger asChild>
        {/* Using a span instead of div for better inline behavior */}
        <span className="inline-block">{trigger}</span>
      </RadixPopover.Trigger>

      {/* Content that appears next to the trigger */}
      <AnimatePresence>
        {isOpen && (
          <RadixPopover.Portal forceMount>
            <RadixPopover.Content
              className={contentBaseClasses}
              align={align}
              side={side}
              sideOffset={10}
              avoidCollisions
              asChild
            >
              <motion.div
                initial={{ opacity: 0.4, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {showArrow && (
                  <RadixPopover.Arrow
                    className="fill-white/80 stroke-border-default stroke-1"
                    width={12}
                    height={7}
                  />
                )}
                {options ? renderOptionsContent() : children}
              </motion.div>
            </RadixPopover.Content>
          </RadixPopover.Portal>
        )}
      </AnimatePresence>
    </RadixPopover.Root>
  );
};

// Convenient sub-components to structure content
export const PopoverHeading = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`font-semibold p-small py-xSmall ${className}`}>
    {children}
    <PopoverSeparator />
  </div>
);

export const PopoverBody = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`text-sm text-text-body ${className}`}>{children}</div>;

export const PopoverSeparator = ({
  className = "",
}: {
  className?: string;
}) => <div className={`h-px bg-border-default mt-xSmall ${className}`} />;

export const PopoverItem = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const combinedClasses = [
    "px-small py-xSmall hover:bg-control-secondaryHover rounded-md cursor-pointer",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ].join(" ");

  const handleInteraction = React.useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent | React.TouchEvent) => {
      if (!disabled && onClick) {
        e?.preventDefault();
        onClick();
      }
    },
    [disabled, onClick]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        handleInteraction(e);
      }
    },
    [handleInteraction]
  );

  return (
    <div
      className={combinedClasses}
      onClick={disabled ? undefined : handleInteraction}
      onKeyDown={disabled ? undefined : handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

export default Popover;
