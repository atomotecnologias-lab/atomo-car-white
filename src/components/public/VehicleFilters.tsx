import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

export interface FiltersState {
  q: string;
  brand: string;
  transmission: string;
  fuel: string;
  priceMax: string;
  yearMin: string;
}

export const EMPTY_FILTERS: FiltersState = {
  q: "",
  brand: "all",
  transmission: "all",
  fuel: "all",
  priceMax: "all",
  yearMin: "all",
};

export function VehicleFilters({
  brands,
  value,
  onChange,
}: {
  brands: string[];
  value: FiltersState;
  onChange: (v: FiltersState) => void;
}) {
  const set = <K extends keyof FiltersState>(k: K, v: FiltersState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-clean">Filtros</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar
          </Button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="q">Busca</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q"
                placeholder="Marca, modelo ou versão"
                value={value.q}
                onChange={(e) => set("q", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <FilterSelect label="Marca" value={value.brand} onChange={(v) => set("brand", v)}
            options={[{ value: "all", label: "Todas" }, ...brands.map((b) => ({ value: b, label: b }))]} />

          <FilterSelect label="Câmbio" value={value.transmission} onChange={(v) => set("transmission", v)}
            options={[
              { value: "all", label: "Todos" },
              { value: "automatic", label: "Automático" },
              { value: "manual", label: "Manual" },
              { value: "cvt", label: "CVT" },
            ]} />

          <FilterSelect label="Combustível" value={value.fuel} onChange={(v) => set("fuel", v)}
            options={[
              { value: "all", label: "Todos" },
              { value: "flex", label: "Flex" },
              { value: "gasoline", label: "Gasolina" },
              { value: "diesel", label: "Diesel" },
              { value: "hybrid", label: "Híbrido" },
            ]} />

          <FilterSelect label="Preço até" value={value.priceMax} onChange={(v) => set("priceMax", v)}
            options={[
              { value: "all", label: "Sem limite" },
              { value: "80000", label: "R$ 80 mil" },
              { value: "100000", label: "R$ 100 mil" },
              { value: "130000", label: "R$ 130 mil" },
              { value: "160000", label: "R$ 160 mil" },
              { value: "200000", label: "R$ 200 mil" },
            ]} />

          <FilterSelect label="Ano a partir de" value={value.yearMin} onChange={(v) => set("yearMin", v)}
            options={[
              { value: "all", label: "Qualquer" },
              { value: "2024", label: "2024" },
              { value: "2023", label: "2023" },
              { value: "2022", label: "2022" },
              { value: "2020", label: "2020" },
            ]} />
        </div>
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
