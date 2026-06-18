import { Search, Bell, ExternalLink, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminMobileDrawer } from "./AdminSidebar";
import primosLogo from "@/assets/primos-logo.png.asset.json";

export function AdminTopbar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-carbon/85 backdrop-blur-xl">
      <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:h-20 lg:gap-6 lg:px-8 lg:py-0">
        {/* Mobile hamburger + logo */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-premium text-clean/80 hover:text-clean lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md bg-premium ring-1 ring-white/5 lg:hidden">
          <img src={primosLogo.url} alt="Primos" className="h-8 w-8 object-contain" />
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-semibold tracking-tight text-clean sm:text-lg lg:text-xl">
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 hidden text-xs text-titanium sm:block">{subtitle}</p>}
        </div>

        <div className="relative hidden md:block">
          <label htmlFor="admin-topbar-search" className="sr-only">
            Buscar no cockpit
          </label>
          <Search aria-hidden className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-titanium" />
          <input
            id="admin-topbar-search"
            type="search"
            placeholder="Buscar..."
            className="h-10 w-56 rounded-lg border border-white/[0.08] bg-premium pl-9 pr-3 text-sm text-clean placeholder:text-titanium focus:border-performance/40 focus:outline-none focus:ring-2 focus:ring-performance/20 xl:w-72"
          />
        </div>

        <button
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-premium text-clean/80 hover:text-clean"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-performance" />
        </button>

        <Link
          to="/"
          target="_blank"
          className="hidden items-center gap-1.5 rounded-lg border border-white/[0.08] bg-premium px-3 py-2 text-xs text-clean/80 hover:text-clean lg:inline-flex"
        >
          Ver site
          <ExternalLink className="h-3 w-3" />
        </Link>

        {actions && <div className="hidden items-center gap-2 sm:flex">{actions}</div>}
      </div>

      {/* Mobile actions row */}
      {actions && (
        <div className="flex items-center gap-2 overflow-x-auto border-t border-white/[0.04] px-4 py-2 sm:hidden [&>*]:shrink-0">
          {actions}
        </div>
      )}

      <AdminMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
