import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Stepper } from "@/components/admin/stepper/Stepper";
import { Button } from "@/components/ui/button";
import {
  INITIAL,
  STEPS,
  type FormState,
} from "@/components/admin/new-vehicle/types";
import { validateAll } from "@/components/admin/new-vehicle/validation";
import { ProgressCard } from "@/components/admin/new-vehicle/fields";
import { PlateStep } from "@/components/admin/new-vehicle/PlateStep";
import { MileageStep } from "@/components/admin/new-vehicle/MileageStep";
import { IdentityStep } from "@/components/admin/new-vehicle/IdentityStep";
import { SpecsStep } from "@/components/admin/new-vehicle/SpecsStep";
import { PriceStep } from "@/components/admin/new-vehicle/PriceStep";
import { FeaturesStep } from "@/components/admin/new-vehicle/FeaturesStep";
import { PhotosStep } from "@/components/admin/new-vehicle/PhotosStep";
import { ContentStep } from "@/components/admin/new-vehicle/ContentStep";
import { ReviewStep } from "@/components/admin/new-vehicle/ReviewStep";
import { createVehicle } from "@/services/vehiclesService";
import { saveVehicleImages } from "@/services/imageService";
import type { PhotoSlotKey } from "@/types";

function parsePrice(raw: string): number {
  return Number(raw.replace(/[^\d]/g, '')) || 0
}

function parseMileage(raw: string): number {
  return parseInt(raw.replace(/[^\d]/g, ''), 10) || 0
}

export const Route = createFileRoute("/admin/veiculos/novo")({
  head: () => ({
    meta: [{ title: "Novo veículo — Cockpit" }, { name: "robots", content: "noindex" }],
  }),
  component: NewVehiclePage,
});

function NewVehiclePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [uploadPct, setUploadPct] = useState<number | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validation = useMemo(() => validateAll(form), [form]);
  const completed = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < stepIdx; i++) s.add(STEPS[i].key);
    return s;
  }, [stepIdx]);

  const currentStep = STEPS[stepIdx];
  const currentErrors = validation.stepErrors[currentStep.key];
  const canAdvance = currentErrors.length === 0;
  const isLast = stepIdx === STEPS.length - 1;

  const goNext = async () => {
    if (!canAdvance) {
      toast.error("Preencha os campos obrigatórios antes de avançar");
      return;
    }
    if (isLast) {
      setSaving(true);
      try {
        setSaveLabel("Salvando veículo…");
        const vehicle = await createVehicle({
          brand: form.brand,
          model: form.model,
          version: form.version,
          yearManufacture: parseInt(form.yearManufacture, 10),
          yearModel: parseInt(form.yearModel, 10),
          price: parsePrice(form.price),
          mileage: parseMileage(form.mileage),
          transmission: form.transmission || 'manual',
          fuel: form.fuel || 'flex',
          color: form.color,
          doors: parseInt(form.doors, 10) || 4,
          plateFinal: form.plate ? form.plate.slice(-1) : undefined,
          descriptionShort: form.descriptionShort,
          descriptionFull: form.descriptionFull,
          status: form.status,
          isFeatured: form.isFeatured,
          features: form.features,
        });

        const photoEntries = Object.entries(form.photoFiles) as [PhotoSlotKey, File][];
        if (photoEntries.length > 0) {
          setSaveLabel(`Enviando ${photoEntries.length} foto(s)…`);
          setUploadPct(0);
          await saveVehicleImages(
            vehicle.id,
            photoEntries.map(([slot, file], idx) => ({
              slot,
              file,
              isMain: slot === form.mainPhotoKey,
              sortOrder: idx,
            })),
            (done, total) => setUploadPct(Math.round((done / total) * 100)),
          );
        }

        toast.success("Veículo cadastrado com sucesso!");
        navigate({ to: "/admin/veiculos/$id", params: { id: vehicle.id } });
      } catch (err) {
        console.error(err);
        toast.error("Erro ao salvar veículo. Tente novamente.");
      } finally {
        setSaving(false);
        setSaveLabel("");
        setUploadPct(null);
      }
      return;
    }
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  };

  const goPrev = () => setStepIdx((i) => Math.max(0, i - 1));

  return (
    <>
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/80 backdrop-blur-sm">
          <div className="w-[88%] max-w-sm rounded-2xl border border-white/[0.08] bg-premium p-6 text-center shadow-2xl">
            <div className="text-sm font-medium text-clean">
              {saveLabel || "Salvando…"}
            </div>
            {uploadPct !== null ? (
              <>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-performance transition-all duration-300"
                    style={{ width: `${uploadPct}%` }}
                  />
                </div>
                <div className="mt-2 font-display text-2xl font-semibold text-performance tabular">
                  {uploadPct}%
                </div>
              </>
            ) : (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-performance" />
              </div>
            )}
          </div>
        </div>
      )}

      <AdminTopbar
        title="Novo veículo"
        subtitle="Cadastro guiado — leva cerca de 5 minutos"
        actions={
          <Link
            to="/admin/veiculos"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-premium px-3 py-2 text-xs text-clean/80 hover:text-clean"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[280px_1fr] lg:p-8">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/[0.06] bg-premium p-3">
            <Stepper
              steps={STEPS}
              currentIndex={stepIdx}
              onStepClick={(i) => setStepIdx(i)}
              completed={completed}
            />
          </div>
          <ProgressCard
            current={stepIdx + 1}
            total={STEPS.length}
            score={validation.completeness}
          />
        </aside>

        <section className="space-y-5">
          {/* Mobile step progress bar — hidden on desktop (sidebar handles it) */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex-1 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-performance transition-all duration-500"
                style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] text-titanium tabular">
              {stepIdx + 1}/{STEPS.length}
            </span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-premium">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-performance">
                  Etapa {stepIdx + 1} de {STEPS.length}
                </div>
                <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-clean sm:text-2xl">
                  {currentStep.label}
                </h2>
                {currentStep.description && (
                  <p className="mt-1 text-sm text-titanium">{currentStep.description}</p>
                )}
              </div>
              {currentErrors.length === 0 ? (
                <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-performance/30 bg-performance/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-performance">
                  <Check className="h-3 w-3" /> Pronto
                </div>
              ) : (
                <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300">
                  {currentErrors.length} pend.
                </div>
              )}
            </header>

            <div className="p-4 sm:p-6 lg:p-8">
              {currentStep.key === "plate" && <PlateStep form={form} set={set} />}
              {currentStep.key === "mileage" && <MileageStep form={form} set={set} />}
              {currentStep.key === "identity" && <IdentityStep form={form} set={set} />}
              {currentStep.key === "specs" && <SpecsStep form={form} set={set} />}
              {currentStep.key === "price" && <PriceStep form={form} set={set} />}
              {currentStep.key === "features" && <FeaturesStep form={form} set={set} />}
              {currentStep.key === "photos" && <PhotosStep form={form} set={set} />}
              {currentStep.key === "content" && <ContentStep form={form} set={set} />}
              {currentStep.key === "review" && <ReviewStep form={form} />}
            </div>

            <footer className="sticky bottom-0 z-10 border-t border-white/[0.06] bg-premium/95 px-3 sm:px-6 pt-3 sm:pt-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-premium/80">
              {currentErrors.length > 0 && (
                <div className="mb-2 text-xs text-amber-300/90 md:hidden">
                  {currentErrors[0]}
                </div>
              )}
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={stepIdx === 0}
                  className="inline-flex h-11 sm:h-auto items-center gap-2 rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-clean/80 transition-colors hover:text-clean disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>

                <div className="hidden text-xs text-titanium md:block">
                  {currentErrors.length > 0 ? (
                    <span className="text-amber-300/90">{currentErrors[0]}</span>
                  ) : (
                    <span>Tudo certo para avançar</span>
                  )}
                </div>

                <Button
                  onClick={goNext}
                  disabled={!canAdvance || saving}
                  className="h-11 sm:h-auto bg-performance text-carbon hover:bg-racing disabled:bg-white/10 disabled:text-titanium"
                >
                  {saving ? (saveLabel || "Salvando…") : isLast ? "Concluir cadastro" : "Avançar"}
                  {!isLast && !saving && <ArrowRight className="h-4 w-4" />}
                  {isLast && !saving && <Check className="h-4 w-4" />}
                </Button>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </>
  );
}

