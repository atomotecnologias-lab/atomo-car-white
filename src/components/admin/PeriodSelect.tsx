import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Seletor de período padrão do painel. Genérico: recebe as opções e devolve a chave.
 * Usado no fluxo de caixa (meses), contas, comissões e vendas.
 */
export function PeriodSelect<K extends string>({
  value,
  onChange,
  options,
  className,
  ariaLabel = "Filtrar por período",
}: {
  value: K;
  onChange: (key: K) => void;
  options: readonly { key: K; label: string }[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <Calendar className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as K)}
        aria-label={ariaLabel}
        className="appearance-none rounded-full border border-input bg-background py-1.5 pl-8 pr-7 text-xs font-medium text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 h-3 w-3 text-muted-foreground"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
      >
        <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
