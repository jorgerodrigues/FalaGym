"use client";

import React, { useState } from "react";
import { ChevronIcon } from "@/icons/Chevron";
import { motion } from "framer-motion";

// Animation variants
const accordionContainerVariants = {
  layout: {
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1],
  },
};

const accordionItemVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    duration: 0.2,
    ease: [0.16, 1, 0.3, 1],
  },
};

const chevronVariants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
  transition: {
    duration: 0.2,
    ease: [0.16, 1, 0.3, 1],
  },
};

const contentVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
  transition: {
    duration: 0.25,
    ease: [0.04, 0.62, 0.23, 0.98],
  },
};

// Accordion spacing variants
export type AccordionSpacing = "none" | "xSmall" | "small" | "large" | "xLarge";

// Accordion container props
export interface AccordionProps {
  /** Child AccordionItem components */
  children: React.ReactNode;
  /** Spacing between accordion items */
  spacing?: AccordionSpacing;
  /** Additional CSS classes */
  className?: string;
  /** Whether multiple items can be open at once */
  allowMultiple?: boolean;
  /** Default open items (by index) */
  defaultOpen?: number[];
}

// Accordion item props
export interface AccordionItemProps {
  /** Title/header content */
  title: React.ReactNode;
  /** Content to show when expanded */
  children: React.ReactNode;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier for this item */
  id?: string;
}

// Internal props for AccordionItem when used within Accordion
interface AccordionItemInternalProps extends AccordionItemProps {
  itemIndex?: number;
  isOpen?: boolean;
  onToggle?: () => void;
  spacing?: AccordionSpacing;
}

// Accordion container component
const AccordionRoot: React.FC<AccordionProps> = ({
  children,
  spacing = "small",
  className = "",
  allowMultiple = false,
  defaultOpen = [],
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set(defaultOpen));

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(index);
      }

      return newSet;
    });
  };

  // Spacing styles
  const spacingStyles = {
    none: "gap-0",
    xSmall: "gap-xSmall",
    small: "gap-small",
    large: "gap-large",
    xLarge: "gap-xLarge",
  };

  const baseClasses = [
    "flex flex-col w-full h-full",
    spacingStyles[spacing],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      className={baseClasses}
      layout
      transition={accordionContainerVariants.layout}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<AccordionItemProps>(child)) {
          return React.cloneElement(child, {
            itemIndex: index,
            isOpen: openItems.has(index),
            onToggle: () => toggleItem(index),
            spacing,
          } as AccordionItemInternalProps);
        }
        return child;
      })}
    </motion.div>
  );
};

// Accordion item component
export const AccordionItem: React.FC<AccordionItemInternalProps> = ({
  title,
  children,
  disabled = false,
  className = "",
  id,
  itemIndex = 0,
  isOpen = false,
  onToggle,
  spacing = "small",
}) => {
  const handleToggle = () => {
    if (!disabled && onToggle) {
      onToggle();
    }
  };

  // Base styles following the Card pattern
  const baseStyles = [
    "flex flex-col w-full",
    "bg-white bg-opacity-40",
    spacing !== "none"
      ? "rounded-2xl"
      : `rounded-none first:rounded-t-2xl last:rounded-b-2xl`,
    "backdrop-blur-xl",
    "border-1 border-border-default",
    "shadow",
    "transition-all duration-200",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Header styles
  const headerStyles = [
    "flex items-center justify-between",
    "p-small",
    "cursor-pointer",
    "transition-colors duration-100",
    disabled ? "cursor-not-allowed" : "hover:bg-white/20",
    "focus-visible:outline-none",
    "rounded-t-2xl",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      className={`${baseStyles} ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      id={id}
      layout
      initial={accordionItemVariants.initial}
      animate={accordionItemVariants.animate}
      transition={accordionItemVariants.transition}
      onClick={handleToggle}
    >
      {/* Header */}
      <div
        id={`accordion-header-${itemIndex}`}
        aria-expanded={isOpen}
        className={headerStyles.replace("cursor-pointer", "")}
      >
        <div className="flex-1 text-left">
          {typeof title === "string" ? (
            <span className="text-base font-medium text-text-dark capitalize">
              {title}
            </span>
          ) : (
            title
          )}
        </div>

        <motion.div
          animate={
            isOpen ? chevronVariants.expanded : chevronVariants.collapsed
          }
          transition={chevronVariants.transition}
        >
          <ChevronIcon
            size={20}
            className={`
              text-text-light
              ${disabled ? "opacity-50" : ""}
            `}
          />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        className="overflow-hidden"
        initial={false}
        animate={isOpen ? contentVariants.expanded : contentVariants.collapsed}
        transition={contentVariants.transition}
        id={`accordion-content-${itemIndex}`}
        aria-labelledby={`accordion-header-${itemIndex}`}
      >
        <div className="px-small pb-large">{children}</div>
      </motion.div>
    </motion.div>
  );
};

// Create compound component type
interface AccordionComponent extends React.FC<AccordionProps> {
  Item: typeof AccordionItem;
}

// Create compound component
const Accordion = AccordionRoot as AccordionComponent;
Accordion.Item = AccordionItem;

export { Accordion };
