
import { cn } from "@/lib/utils";
import React from "react";

/**
 * Button component supporting asChild for Next.js Link integration.
 * Forwards ref for accessibility and supports variant/size props.
 */
export const Button = React.forwardRef(
  (
    { className, variant = "default", size = "md", asChild = false, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    const variants = {
      default:
        "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
      outline:
        "border border-neutral-300 bg-transparent hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900",
      ghost: "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900",
    };
    const sizes = {
      sm: "h-8 px-3",
      md: "h-10 px-4",
      lg: "h-12 px-6",
    };

    const Comp = asChild ? props.children.type : "button";
    const compProps = {
      className: cn(base, variants[variant], sizes[size], className),
      ref,
      ...props,
    };

    if (asChild) {
      // Clone child and pass button props
      return React.cloneElement(props.children, compProps);
    }
    return <button {...compProps} />;
  }
);
Button.displayName = "Button";


