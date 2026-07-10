import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const PRICE_OPTIONS = [
  { value: "60000", label: "Até R$ 60 mil" },
  { value: "80000", label: "Até R$ 80 mil" },
  { value: "100000", label: "Até R$ 100 mil" },
  { value: "130000", label: "Até R$ 130 mil" },
  { value: "160000", label: "Até R$ 160 mil" },
  { value: "200000", label: "Até R$ 200 mil" },
];

const YEAR_OPTIONS = [
  { value: "all", label: "Todos anos" },
  { value: "2024", label: "2024+" },
  { value: "2023", label: "2023+" },
  { value: "2022", label: "2022+" },
  { value: "2020", label: "2020+" },
];

export function SearchBar({ brands = [] }: { brands?: string[] }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("all");
  const [priceMax, setPriceMax] = useState<string | undefined>(undefined);
  const [yearMin, setYearMin] = useState<string | undefined>(undefined);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    navigate({
      to: "/estoque",
      search: {
        q: q.trim() || undefined,
        brand: brand !== "all" ? brand : undefined,
        priceMax: priceMax && priceMax !== "all" ? priceMax : undefined,
        yearMin: yearMin && yearMin !== "all" ? yearMin : undefined,
      } as never,
    });
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-white/10 bg-carbon/70 p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-4"
    >
      <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-titanium" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Marca, modelo ou versão"
            className="h-12 border-white/10 bg-white/[0.03] pl-9 text-clean placeholder:text-titanium/70 focus-visible:border-performance focus-visible:ring-performance/30"
          />
        </div>

        <SelectField value={brand} onChange={setBrand} placeholder="Marca">
          <SelectItem value="all">Todas as marcas</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectField>

        <SelectField value={priceMax} onChange={setPriceMax} placeholder="Preço">
          {PRICE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectField>

        <SelectField value={yearMin} onChange={setYearMin} placeholder="Ano">
          {YEAR_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectField>

        <Button
          type="submit"
          size="lg"
          className="group h-12 gap-2 bg-performance px-6 text-clean hover:bg-performance"
        >
          <Search className="h-4 w-4" />
          <span>Buscar</span>
        </Button>
      </div>
    </form>
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string | undefined;
  onChange: (v: string) => void;

  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 border-white/10 bg-white/[0.03] text-clean focus:ring-performance/30 data-[placeholder]:text-titanium/70">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}
