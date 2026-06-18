import { cn } from "@/lib/utils";

export function PriceTag({
  value,
  className,
  size = "md",
}: {
  value: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  };
  return (
    <span
      className={cn(
        "font-display font-medium tabular text-clean",
        sizes[size],
        className,
      )}
    >
      {value}
    </span>
  );
}
