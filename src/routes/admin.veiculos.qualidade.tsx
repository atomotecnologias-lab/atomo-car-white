import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listVehicles } from "@/services/vehiclesService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { QualityScoreRing } from "@/components/admin/QualityScoreRing";
import { StatTile } from "@/components/admin/StatTile";
import { computeQualityScore } from "@/lib/quality-score";
import { ArrowUpRight, ShieldCheck, Star, TrendingDown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/veiculos/qualidade")({
  component: QualidadePage,
});

function QualidadePage() {
  const { data: vehicles = [] } = useQuery({ queryKey: ["admin", "vehicles"], queryFn: listVehicles });

  const avg = vehicles.length
    ? Math.round(vehicles.reduce((a, v) => a + v.qualityScore, 0) / vehicles.length)
    : 0;
  const excellent = vehicles.filter((v) => v.qualityScore >= 90).length;
  const low = vehicles.filter((v) => v.qualityScore < 85).length;

  const sorted = [...vehicles].sort((a, b) => a.qualityScore - b.qualityScore);

  return (
    <>
      <AdminTopbar
        title="Qualidade"
        subtitle="Pontuação dos anúncios — fotos, dados, descrição e SEO."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Média do catálogo" value={`${avg}%`} icon={ShieldCheck} accent />
          <StatTile label="Anúncios excelentes" value={excellent} hint=">= 90%" icon={Star} />
          <StatTile label="Abaixo de 85%" value={low} hint="precisam de atenção" icon={TrendingDown} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-premium">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h2 className="font-display text-base font-semibold text-clean">Ranking de qualidade</h2>
            <p className="text-xs text-titanium">Do mais crítico ao mais completo.</p>
          </div>
          <ul className="divide-y divide-white/[0.04]">
            {sorted.map((v) => {
              const breakdown = computeQualityScore(v);
              return (
                <li key={v.id}>
                  <Link
                    to="/admin/veiculos/$id"
                    params={{ id: v.id }}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]"
                  >
                    <QualityScoreRing value={v.qualityScore} size={48} stroke={4} />
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-white/[0.04]">
                      <img src={v.mainImage} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-titanium">
                        {v.brand}
                      </div>
                      <div className="truncate font-medium text-clean">
                        {v.model} <span className="text-titanium">{v.version}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {breakdown.criteria
                          .filter((b) => !b.satisfied)
                          .slice(0, 3)
                          .map((b) => (
                            <span
                              key={b.key}
                              className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-warning"
                            >
                              {b.label}
                            </span>
                          ))}
                      </div>
                    </div>
                    <button
                      aria-label="Melhorar com IA"
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-performance/30 bg-performance/10 px-2.5 text-[11px] font-medium text-performance md:px-3"
                    >
                      <Sparkles className="h-4 w-4 md:h-3 md:w-3" />
                      <span className="hidden md:inline">Melhorar com IA</span>
                    </button>
                    <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-titanium sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
