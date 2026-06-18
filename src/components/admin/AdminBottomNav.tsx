import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Warehouse, PlusCircle, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminMobileDrawer } from "./AdminSidebar";

/**
 * Bottom tab bar para navegação rápida no mobile.
 * Ícone em cima, label embaixo (nunca sobreposto). Some no desktop (lg:hidden).
 * O botão "Mais" abre o drawer completo com o restante das seções.
 */
export function AdminBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isNovo = pathname === "/admin/veiculos/novo";

  // O cadastro guiado tem rodapé fixo próprio (Voltar/Avançar) — esconder a barra
  // para não sobrepor os controles do wizard.
  if (isNovo) return null;
  const dashActive = pathname === "/admin";
  const estoqueActive = pathname.startsWith("/admin/veiculos") && !isNovo;
  const leadsActive = pathname.startsWith("/admin/leads");

  return (
    <>
      <nav
        aria-label="Navegação rápida"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-carbon/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
          <TabLink to="/admin" label="Início" icon={LayoutDashboard} active={dashActive} />
          <TabLink to="/admin/veiculos" label="Estoque" icon={Warehouse} active={estoqueActive} />
          <TabLink
            to="/admin/veiculos/novo"
            label="Novo"
            icon={PlusCircle}
            active={isNovo}
            highlight
          />
          <TabLink to="/admin/leads" label="Leads" icon={Users} active={leadsActive} />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Mais opções"
            className="flex min-w-[56px] flex-col items-center justify-center gap-1 py-2 text-titanium transition-colors hover:text-clean"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">Mais</span>
          </button>
        </div>
      </nav>

      <AdminMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

function TabLink({
  to,
  label,
  icon: Icon,
  active,
  highlight,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to as "/admin"}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-w-[56px] flex-col items-center justify-center gap-1 py-2 transition-colors",
        active ? "text-performance" : "text-titanium hover:text-clean",
      )}
    >
      <span
        className={cn(
          "grid place-items-center transition-all",
          highlight
            ? "h-9 w-9 rounded-full bg-performance text-carbon shadow-[0_0_18px_rgba(76,193,79,0.45)]"
            : "h-5 w-5",
        )}
      >
        <Icon className={highlight ? "h-5 w-5" : "h-5 w-5"} />
      </span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
  );
}
