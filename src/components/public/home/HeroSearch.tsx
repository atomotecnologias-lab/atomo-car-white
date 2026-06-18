import { useQuery } from "@tanstack/react-query";
import { listPublishedVehicles } from "@/services/vehiclesService";
import { SearchBar } from "./SearchBar";
import { QuickChips } from "./QuickChips";
import { HeroSequence } from "./HeroSequence";
import { ShieldCheck, MapPin } from "lucide-react";

export function HeroSearch() {
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles", "published"],
    queryFn: listPublishedVehicles,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const count = vehicles.length;
  const brands = [...new Set(vehicles.map((v) => v.brand))].sort();

  return (
    <HeroSequence>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-clean/90 backdrop-blur">
            <MapPin className="h-3 w-3 text-performance" />
            Jaraguá do Sul — SC
          </div>

          <h1 className="mt-6 font-display text-[2rem] font-semibold leading-[1.05] tracking-tight text-clean sm:text-5xl lg:text-[3.5rem]">
            Seminovos selecionados.{" "}
            <span className="text-gradient-emerald">Negócios transparentes.</span>
          </h1>

          <p className="mt-5 max-w-xl font-display text-base font-light leading-relaxed tracking-tight text-clean/75 sm:text-lg">
            Na Primos Automóveis você encontra veículos com procedência,
            condições competitivas e atendimento que coloca você em primeiro lugar.
          </p>
        </div>

        <div className="mt-9 max-w-5xl">
          <SearchBar brands={brands} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <QuickChips />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-titanium">
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-performance opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-performance" />
            </span>
            <span className="text-clean">
              <span className="font-display text-base font-medium tabular">{count}</span>{" "}
              veículos disponíveis agora
            </span>
          </div>
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-performance" />
            Procedência verificada em todo estoque
          </div>
        </div>
      </div>
    </HeroSequence>
  );
}
