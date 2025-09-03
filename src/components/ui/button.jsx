import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
    outline: "border border-neutral-300 bg-transparent hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900",
    ghost: "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900",
  };
  const sizes = {
    sm: "h-8 px-3",
    md: "h-10 px-4",
    lg: "h-12 px-6",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}


