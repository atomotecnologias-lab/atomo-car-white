import { Link } from "@tanstack/react-router";
import { Flame, Gauge, Sparkles, Wallet, Car } from "lucide-react";

type Chip = {
  label: string;
  icon: React.ReactNode;
  search: Record<string, string>;
};

const CHIPS: Chip[] = [
  { label: "Até R$ 100 mil", icon: <Wallet className="h-3.5 w-3.5" />, search: { priceMax: "100000" } },
  { label: "Automático", icon: <Gauge className="h-3.5 w-3.5" />, search: { transmission: "automatic" } },
  { label: "SUV", icon: <Car className="h-3.5 w-3.5" />, search: { q: "SUV" } },
  { label: "Recém-chegados", icon: <Sparkles className="h-3.5 w-3.5" />, search: { yearMin: "2024" } },
  { label: "Em destaque", icon: <Flame className="h-3.5 w-3.5" />, search: { featured: "1" } },
];

export function QuickChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => (
        <Link
          key={chip.label}
          to="/estoque"
          search={chip.search as never}
          className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-clean/85 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-performance/60 hover:bg-performance/10 hover:text-clean"
        >
          <span className="text-performance">{chip.icon}</span>
          {chip.label}
        </Link>
      ))}
    </div>
  );
}
