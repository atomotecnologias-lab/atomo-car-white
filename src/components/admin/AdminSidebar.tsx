import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Car,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  Megaphone,
  BarChart3,
  Warehouse,
  PlusCircle,
  Wrench,
  ShieldCheck,
  Send,
  LogOut,
  X,
  HandCoins,
  Receipt,
  Percent,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import atomoCarLogo from "@/assets/atomo-car-logo.svg.asset.json";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Item = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
type Group = { id: string; label: string; icon: typeof LayoutDashboard; basePath: string; children: Item[] };

const dashboard: Item = { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true };

const groups: Group[] = [
  {
    id: "vehicles",
    label: "Veículos",
    icon: Car,
    basePath: "/admin/veiculos",
    children: [
      { to: "/admin/veiculos", label: "Estoque", icon: Warehouse, exact: true },
      { to: "/admin/veiculos/novo", label: "Novo veículo", icon: PlusCircle },
      { to: "/admin/veiculos/producao", label: "Preparação", icon: Wrench },
      { to: "/admin/veiculos/qualidade", label: "Qualidade", icon: ShieldCheck },
    ],
  },
  {
    id: "sales",
    label: "Vendas",
    icon: HandCoins,
    basePath: "/admin/vendas",
    children: [
      { to: "/admin/vendas", label: "Vendas realizadas", icon: Receipt, exact: true },
      { to: "/admin/vendas/nova", label: "Registrar venda", icon: PlusCircle },
      { to: "/admin/vendas/comissoes", label: "Comissões", icon: Percent },
    ],
  },
  {
    id: "finance",
    label: "Financeiro",
    icon: Wallet,
    basePath: "/admin/financeiro",
    children: [
      { to: "/admin/financeiro", label: "Visão geral", icon: CircleDollarSign, exact: true },
      { to: "/admin/financeiro/pagar", label: "A pagar", icon: ArrowUpRight },
      { to: "/admin/financeiro/receber", label: "A receber", icon: ArrowDownLeft },
      { to: "/admin/financeiro/custos", label: "Custos por veículo", icon: Wrench },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    basePath: "/admin/marketing",
    children: [
      { to: "/admin/marketing/conteudo", label: "Conteúdo IA", icon: Sparkles },
      { to: "/admin/marketing/publicacoes", label: "Publicações", icon: Send },
    ],
  },
];

const footerItems: Item[] = [
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

/** Grupos visíveis ao vendedor (o resto é exclusivo do dono). */
const SELLER_GROUP_IDS = new Set(["vehicles"]);

export function useIsItemActive(pathname: string) {
  return (it: Item) => (it.exact ? pathname === it.to : pathname === it.to || pathname.startsWith(it.to + "/"));
}

function SidebarBody({
  collapsed,
  onNavigate,
  showCollapseButton,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  showCollapseButton?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user, role, member } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }
  const isItemActive = useIsItemActive(pathname);

  const visibleGroups = role === "owner" ? groups : groups.filter((g) => SELLER_GROUP_IDS.has(g.id));
  const visibleFooter = role === "owner" ? footerItems : [];

  const initialOpen = useMemo(() => {
    const o: Record<string, boolean> = {};
    for (const g of groups) o[g.id] = pathname.startsWith(g.basePath);
    return o;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5 lg:h-20">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-premium ring-1 ring-white/5">
          <img src={atomoCarLogo.url} alt="Atomo Car" className="h-9 w-9 object-contain" />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold tracking-tight text-clean">Atomo Car</div>
            <div className="text-[9px] uppercase tracking-[0.28em] text-titanium">Cockpit</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <NavLeaf item={dashboard} active={isItemActive(dashboard)} collapsed={collapsed} onNavigate={onNavigate} />

        {visibleGroups.map((g) => {
          const groupActive = pathname.startsWith(g.basePath);
          const isOpen = collapsed ? false : open[g.id] ?? groupActive;
          const Icon = g.icon;
          return (
            <div key={g.id} className="pt-1">
              <button
                type="button"
                onClick={() => setOpen((s) => ({ ...s, [g.id]: !isOpen }))}
                aria-expanded={isOpen}
                aria-controls={`admin-group-${g.id}`}
                aria-label={collapsed ? g.label : undefined}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  groupActive ? "text-clean" : "text-clean/70 hover:bg-white/[0.04] hover:text-clean",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{g.label}</span>
                    <ChevronDown
                      aria-hidden
                      className={cn("h-3.5 w-3.5 text-titanium transition-transform", isOpen && "rotate-180")}
                    />
                  </>
                )}
              </button>

              {isOpen && !collapsed && (
                <div id={`admin-group-${g.id}`} className="mt-0.5 ml-3 space-y-0.5 border-l border-white/[0.06] pl-3">
                  {g.children.map((c) => {
                    const ItemIcon = c.icon;
                    const active = isItemActive(c);
                    return (
                      <Link
                        key={c.to}
                        to={c.to as "/admin"}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                          active
                            ? "bg-performance/10 text-performance"
                            : "text-clean/60 hover:bg-white/[0.04] hover:text-clean",
                        )}
                      >
                        <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{c.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-3">
          {visibleFooter.map((it) => (
            <NavLeaf key={it.to} item={it} active={isItemActive(it)} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className="m-3 rounded-xl border border-white/[0.06] bg-premium p-3">
        {collapsed ? (
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sair"
            className="flex w-full items-center justify-center rounded-lg py-2 text-titanium hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-performance/20 text-xs font-semibold text-performance">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-clean">
                {member?.name ?? user?.email ?? 'Admin'}
              </p>
              <p className="text-[10px] text-titanium">
                {role === 'owner' ? 'Dono da loja' : 'Vendedor'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sair"
              className="shrink-0 rounded-lg p-1.5 text-titanium hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {showCollapseButton && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          aria-expanded={!collapsed}
          className="m-3 flex items-center justify-center gap-2 rounded-lg border border-white/[0.06] py-2 text-[10px] uppercase tracking-[0.18em] text-titanium hover:bg-white/[0.04] hover:text-clean"
        >
          <ChevronLeft aria-hidden className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Recolher"}
        </button>
      )}
    </>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={cn(
        "admin-dark sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#0B0F0D] text-clean transition-[width] duration-300 lg:flex",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <SidebarBody
        collapsed={collapsed}
        showCollapseButton
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
    </aside>
  );
}

export function AdminMobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Renderiza via portal no body para escapar de ancestrais com backdrop-filter
  // (ex.: o header/topbar), que criam um containing block e quebram o `fixed`.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on route change is handled by passing onNavigate to links
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu do cockpit"
        className={cn(
          "admin-dark absolute inset-y-0 left-0 flex w-[82vw] max-w-[300px] flex-col border-r border-white/[0.06] bg-[#0B0F0D] text-clean shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
          className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-lg border border-white/[0.08] bg-premium text-clean/80 hover:text-clean"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarBody collapsed={false} onNavigate={onClose} />
      </aside>
    </div>,
    document.body,
  );
}

function NavLeaf({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: Item;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to as "/admin"}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
        active
          ? "bg-performance/10 text-performance"
          : "text-clean/70 hover:bg-white/[0.04] hover:text-clean",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-performance transition-all",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-30",
        )}
      />
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
