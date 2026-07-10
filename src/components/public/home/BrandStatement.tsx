import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

export function BrandStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      setOffset(Math.max(-1, Math.min(1, progress)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-premium py-24 sm:py-32"
      aria-label="ToniKar"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.18]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-performance/10 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-racing/10 blur-[140px]"
      />

      {/* Monumental wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center"
        style={{ transform: `translate3d(0, calc(-50% + ${offset * -40}px), 0)` }}
      >
        <span
          className="block font-display font-semibold leading-none tracking-[-0.04em] text-clean/[0.055]"
          style={{ fontSize: "clamp(80px, 14vw, 220px)" }}
        >
          TONIKAR
        </span>
      </div>

      {/* Foreground — narrow column, no logo */}
      <div className="relative mx-auto flex max-w-md flex-col items-center px-4 text-center sm:max-w-lg sm:px-6">
        <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-clean sm:text-3xl">
          Automóveis com{" "}
          <span className="text-gradient-emerald">procedência</span>.
        </h2>
        <p className="mt-4 max-w-sm font-display text-sm font-light leading-relaxed tracking-tight text-clean/70 sm:text-base">
          Curadoria local, atendimento humano e veículos selecionados um a um.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-clean/85 backdrop-blur">
          <MapPin className="h-3 w-3 text-performance" />
          Jaraguá do Sul — SC
        </div>
      </div>
    </section>
  );
}
