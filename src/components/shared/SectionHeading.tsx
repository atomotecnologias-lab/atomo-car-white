import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
          <span className="h-px w-6 bg-gold" />
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl font-medium leading-[1.05] text-clean sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 font-display text-base font-light leading-relaxed tracking-tight text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
