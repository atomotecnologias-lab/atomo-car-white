import { createFileRoute, Link, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getVehicleById, updateVehicleStatus, updateVehicle } from "@/services/vehiclesService";
import {
  saveVehicleImages,
  deleteVehicleImage,
  setCoverImage,
  reorderImages,
} from "@/services/imageService";
import { computeQualityScore } from "@/lib/quality-score";
import { toast } from "sonner";
import { generateAssistedContent } from "@/lib/assisted-content";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { VehicleStatusBadge } from "@/components/admin/VehicleStatusBadge";
import { QualityScoreRing } from "@/components/admin/QualityScoreRing";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBRL, formatKm, formatYear, fuelLabel, transmissionLabel } from "@/lib/format";
import {
  ArrowLeft,
  Eye,
  Copy,
  Check,
  Camera,
  CircleCheck,
  CircleAlert,
  ExternalLink,
  Pencil,
  X,
  Star,
  Trash2,
  GripVertical,
  Loader2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/veiculos/$id")({
  loader: async ({ params }) => {
    const v = await getVehicleById(params.id);
    if (!v) throw notFound();
    return v;
  },
  component: VehicleDetailAdmin,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-clean">Veículo não encontrado.</div>
  ),
});

function VehicleDetailAdmin() {
  const vehicle = Route.useLoaderData() as import("@/types").Vehicle;
  const score = computeQualityScore(vehicle);
  const content = generateAssistedContent(vehicle);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    price: String(vehicle.price),
    status: vehicle.status,
    descriptionShort: vehicle.descriptionShort,
    descriptionFull: vehicle.descriptionFull,
    isFeatured: vehicle.isFeatured,
  });
  const [editSaving, setEditSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoBusy, setPhotoBusy] = useState<string | null>(null);
  const [imgs, setImgs] = useState(vehicle.images);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    setImgs(vehicle.images);
  }, [vehicle.images]);

  async function invalidateAll() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] }),
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'published'] }),
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'featured'] }),
    ]);
    router.invalidate();
  }

  async function handleSetCover(imageId: string) {
    setPhotoBusy(imageId);
    try {
      await setCoverImage(vehicle.id, imageId);
      await invalidateAll();
      toast.success('Foto de capa atualizada!');
    } catch {
      toast.error('Erro ao definir a capa.');
    } finally {
      setPhotoBusy(null);
    }
  }

  async function handleDeletePhoto(imageId: string, storagePath: string) {
    if (!confirm('Remover esta foto? A ação não pode ser desfeita.')) return;
    setPhotoBusy(imageId);
    try {
      await deleteVehicleImage(imageId, storagePath);
      await invalidateAll();
      toast.success('Foto removida.');
    } catch {
      toast.error('Erro ao remover a foto.');
    } finally {
      setPhotoBusy(null);
    }
  }

  async function persistOrder(ordered: typeof imgs) {
    setImgs(ordered);
    try {
      await reorderImages(ordered.map((img, i) => ({ id: img.id, sortOrder: i })));
      await invalidateAll();
    } catch {
      toast.error('Erro ao reordenar.');
      setImgs(vehicle.images);
    }
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...imgs];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    void persistOrder(next);
  }

  async function handleEditSave() {
    setEditSaving(true);
    try {
      await updateVehicle(vehicle.id, {
        price: Number(editForm.price.replace(/[^\d]/g, '')) || vehicle.price,
        status: editForm.status,
        descriptionShort: editForm.descriptionShort,
        descriptionFull: editForm.descriptionFull,
        isFeatured: editForm.isFeatured,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles', 'published'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles', 'featured'] }),
      ]);
      router.invalidate();
      toast.success('Veículo atualizado!');
      setEditOpen(false);
    } catch {
      toast.error('Erro ao atualizar. Tente novamente.');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleAddPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPhotoUploading(true);
    try {
      const entries = Array.from(files).map((file, i) => ({
        slot: 'exterior_detail' as import('@/types').PhotoSlotKey,
        file,
        isMain: vehicle.images.length === 0 && i === 0,
        sortOrder: vehicle.images.length + i,
      }));
      await saveVehicleImages(vehicle.id, entries);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
      router.invalidate();
      toast.success(`${files.length} foto(s) adicionadas!`);
    } catch {
      toast.error('Erro ao enviar fotos.');
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handlePublish() {
    const nextStatus = vehicle.isPublished ? 'draft' : 'active';
    setPublishing(true);
    try {
      await updateVehicleStatus(vehicle.id, nextStatus as import("@/types").VehicleStatus);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles', 'published'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles', 'featured'] }),
      ]);
      toast.success(nextStatus === 'active' ? 'Veículo publicado!' : 'Veículo despublicado.');
      navigate({ to: '/admin/veiculos' });
    } catch {
      toast.error('Erro ao atualizar status. Tente novamente.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <AdminTopbar
        title={`${vehicle.brand} ${vehicle.model}`}
        subtitle={`${vehicle.version} • ${formatYear(vehicle.yearManufacture, vehicle.yearModel)} • ${formatKm(vehicle.mileage)}`}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => setEditOpen(true)}
              variant="outline"
              className="border-white/15 bg-transparent text-clean hover:bg-white/[0.04]"
            >
              <Tag className="h-4 w-4" />
              Alterar preço
            </Button>
            <Button
              onClick={() => setEditOpen(true)}
              variant="outline"
              className="border-white/15 bg-transparent text-clean hover:bg-white/[0.04]"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button asChild variant="outline" className="border-white/15 bg-transparent text-clean hover:bg-white/[0.04]">
              <Link to="/veiculo/$slug" params={{ slug: vehicle.slug }} target="_blank">
                <Eye className="h-4 w-4" />
                Visualizar
              </Link>
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-performance text-carbon hover:bg-racing disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {publishing ? 'Salvando…' : vehicle.isPublished ? 'Despublicar' : 'Publicar'}
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header card */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-white/[0.06] bg-premium p-6">
            <Link
              to="/admin/veiculos"
              className="inline-flex items-center gap-1 text-xs text-titanium hover:text-clean"
            >
              <ArrowLeft className="h-3 w-3" /> Voltar para veículos
            </Link>
            <div className="mt-4 flex items-start gap-5">
              <div className="h-28 w-44 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                <img src={vehicle.mainImage} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">
                  {vehicle.brand}
                </div>
                <h2 className="mt-1 font-display text-2xl font-semibold text-clean">
                  {vehicle.model} <span className="text-titanium">{vehicle.version}</span>
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <VehicleStatusBadge status={vehicle.status} />
                  {vehicle.isPublished ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-performance/30 bg-performance/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-performance">
                      <CircleCheck className="h-3 w-3" /> Publicado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-titanium/30 bg-titanium/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-titanium">
                      <CircleAlert className="h-3 w-3" /> Não publicado
                    </span>
                  )}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <Cell label="Preço" value={formatBRL(vehicle.price)} highlight />
                  <Cell label="KM" value={formatKm(vehicle.mileage)} />
                  <Cell label="Câmbio" value={transmissionLabel(vehicle.transmission)} />
                  <Cell label="Combustível" value={fuelLabel(vehicle.fuel)} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-premium p-6">
            <div className="text-center">
              <QualityScoreRing value={score.total} size={120} stroke={9} showLabel={false} />
              <div className="-mt-[88px] mb-[60px]">
                <div className="font-display text-3xl font-semibold text-clean tabular">
                  {score.total}<span className="text-titanium text-base">%</span>
                </div>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-titanium">
                Qualidade do anúncio
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl border border-white/[0.06] bg-premium p-1 [&::-webkit-scrollbar]:hidden">
            <Tab value="overview">Visão geral</Tab>
            <Tab value="photos">Fotos</Tab>
            <Tab value="content">Conteúdo</Tab>
            <Tab value="checklist">Checklist</Tab>
            <Tab value="history">Histórico</Tab>
          </TabsList>

          <TabsContent value="overview" className="m-0 space-y-5">
            <Panel title="Descrição">
              <p className="whitespace-pre-line text-sm leading-relaxed text-clean/80">
                {vehicle.descriptionFull}
              </p>
            </Panel>
            <Panel title={`Opcionais (${vehicle.features.length})`}>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-white/[0.06] bg-carbon px-3 py-1 text-xs text-clean/80"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="photos" className="m-0">
            <Panel
              title={`Fotos (${vehicle.images.length})`}
              action={
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-xs text-clean hover:bg-white/[0.04]">
                  <Camera className="h-3.5 w-3.5" />
                  {photoUploading ? 'Enviando…' : 'Adicionar'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAddPhotos(e.target.files)}
                  />
                </label>
              }
            >
              {imgs.length === 0 ? (
                <p className="py-8 text-center text-sm text-titanium">
                  Nenhuma foto ainda. Use o botão “Adicionar” acima.
                </p>
              ) : (
                <>
                  <p className="mb-3 text-[11px] text-titanium">
                    Arraste para reordenar · toque nos botões para definir a capa ou remover.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {imgs.map((img, index) => (
                      <figure
                        key={img.id}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(index)}
                        className={cn(
                          "group relative cursor-move overflow-hidden rounded-lg border bg-carbon transition-opacity",
                          img.isMain ? "border-performance/50" : "border-white/[0.06]",
                          dragIndex === index && "opacity-40",
                        )}
                      >
                        <div className="aspect-[4/3]">
                          <img
                            src={img.url}
                            alt={img.label ?? ""}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* drag handle */}
                        <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-md bg-carbon/70 text-titanium opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <GripVertical className="h-3.5 w-3.5" />
                        </span>

                        {/* cover badge */}
                        {img.isMain && (
                          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-performance/90 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-carbon">
                            <Star className="h-2.5 w-2.5 fill-carbon" /> Capa
                          </span>
                        )}

                        {/* actions — sempre visíveis no mobile (sem hover) */}
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-gradient-to-t from-carbon/95 via-carbon/60 to-transparent px-2 py-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          {photoBusy === img.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-clean" />
                          ) : (
                            <>
                              {!img.isMain && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCover(img.id)}
                                  title="Tornar capa"
                                  className="inline-flex items-center gap-1 rounded-md bg-carbon/80 px-2.5 py-2 text-[10px] text-clean hover:bg-performance hover:text-carbon md:py-1"
                                >
                                  <Star className="h-3.5 w-3.5 md:h-3 md:w-3" /> Capa
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(img.id, img.storagePath)}
                                title="Remover foto"
                                aria-label="Remover foto"
                                className="inline-flex items-center justify-center rounded-md bg-carbon/80 p-2 text-clean hover:bg-red-500 hover:text-white md:p-1.5"
                              >
                                <Trash2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </figure>
                    ))}
                  </div>
                </>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="content" className="m-0 space-y-4">
            <p className="text-xs text-titanium">
              Textos gerados deterministicamente a partir da ficha do veículo.
              Revise e copie para o canal desejado.
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              {content.map((c) => (
                <CopyableText key={c.channel} label={c.label} text={c.text} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="m-0">
            <Panel title="Critérios de qualidade">
              <ul className="divide-y divide-white/[0.04]">
                {score.criteria.map((c) => (
                  <li key={c.key} className="flex items-center gap-3 py-3">
                    <span
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-full",
                        c.satisfied ? "bg-performance/15 text-performance" : "bg-white/[0.04] text-titanium",
                      )}
                    >
                      {c.satisfied ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </span>
                    <span className={cn("flex-1 text-sm", c.satisfied ? "text-clean" : "text-titanium")}>
                      {c.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-titanium tabular">
                      +{c.weight}%
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </TabsContent>

          <TabsContent value="history" className="m-0">
            <Panel title="Histórico">
              <ul className="space-y-4 text-sm">
                <Event title="Cadastro criado" date={vehicle.createdAt} />
                <Event title="Última atualização" date={vehicle.updatedAt} />
                {vehicle.isPublished && <Event title="Publicado no site" date={vehicle.updatedAt} accent />}
              </ul>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0B0F0D] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-clean">Editar veículo</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-titanium hover:text-clean"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-titanium">
                  Preço (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full rounded-lg border border-white/[0.08] bg-carbon px-4 py-2.5 text-sm text-clean focus:border-performance/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-titanium">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['draft', 'awaiting_photos', 'active', 'reserved', 'sold', 'inactive'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, status: s }))}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                        editForm.status === s
                          ? "border-performance bg-performance/15 text-performance"
                          : "border-white/[0.08] bg-carbon text-clean/80 hover:text-clean",
                      )}
                    >
                      {s === 'draft' ? 'Rascunho' : s === 'awaiting_photos' ? 'Ag. fotos' : s === 'active' ? 'Publicado' : s === 'reserved' ? 'Reservado' : s === 'sold' ? 'Vendido' : 'Inativo'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-titanium">
                  Descrição curta
                </label>
                <textarea
                  value={editForm.descriptionShort}
                  onChange={(e) => setEditForm((f) => ({ ...f, descriptionShort: e.target.value.slice(0, 180) }))}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-white/[0.08] bg-carbon px-4 py-2.5 text-sm text-clean focus:border-performance/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-titanium">
                  Descrição completa
                </label>
                <textarea
                  value={editForm.descriptionFull}
                  onChange={(e) => setEditForm((f) => ({ ...f, descriptionFull: e.target.value }))}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-white/[0.08] bg-carbon px-4 py-2.5 text-sm text-clean focus:border-performance/40 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setEditForm((f) => ({ ...f, isFeatured: !f.isFeatured }))}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors",
                  editForm.isFeatured
                    ? "border-performance/40 bg-performance/10 text-performance"
                    : "border-white/[0.08] bg-carbon text-clean/80",
                )}
              >
                <Star
                  className={cn("h-4 w-4", editForm.isFeatured && "fill-performance")}
                  strokeWidth={1.5}
                />
                {editForm.isFeatured ? 'Em destaque' : 'Marcar destaque'}
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-titanium hover:text-clean"
              >
                Cancelar
              </button>
              <Button
                onClick={handleEditSave}
                disabled={editSaving}
                className="bg-performance text-carbon hover:bg-racing disabled:opacity-50"
              >
                {editSaving ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Cell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-titanium">{label}</div>
      <div className={cn("mt-1 font-display tabular", highlight ? "text-xl text-performance" : "text-sm text-clean")}>
        {value}
      </div>
    </div>
  );
}

function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="shrink-0 rounded-xl px-4 py-2 text-xs uppercase tracking-[0.16em] text-titanium data-[state=active]:bg-performance/15 data-[state=active]:text-performance"
    >
      {children}
    </TabsTrigger>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-premium">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <h3 className="font-display text-sm font-semibold text-clean">{title}</h3>
        {action}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

function CopyableText({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-premium">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">{label}</span>
        <button
          onClick={onCopy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.14em] transition-colors",
            copied
              ? "border-performance/40 bg-performance/10 text-performance"
              : "border-white/[0.06] text-titanium hover:text-clean",
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "copiado" : "copiar"}
        </button>
      </div>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap px-5 py-4 font-sans text-[13px] leading-relaxed text-clean/85">
        {text}
      </pre>
    </div>
  );
}

function Event({ title, date, accent }: { title: string; date: string; accent?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full",
          accent ? "bg-performance/20 text-performance" : "bg-white/[0.04] text-titanium",
        )}
      >
        {accent ? <CircleCheck className="h-3.5 w-3.5" /> : <ExternalLink className="h-3 w-3" />}
      </span>
      <div>
        <div className="text-sm text-clean">{title}</div>
        <div className="text-[11px] text-titanium tabular">
          {new Date(date).toLocaleString("pt-BR")}
        </div>
      </div>
    </li>
  );
}
