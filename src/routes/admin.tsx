import { createFileRoute, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin/") {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [{ title: "ToniKar — Central de Operações" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

/**
 * Rotas restritas ao dono. O enforcement REAL é a RLS no banco —
 * este guard é conveniência de UX (evita telas vazias para o vendedor).
 */
const OWNER_ONLY_PREFIXES = [
  "/admin/financeiro",
  "/admin/vendas",
  "/admin/relatorios",
  "/admin/configuracoes",
  "/admin/marketing",
];

function AdminLayout() {
  const { session, loading, role } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isNovo = pathname === "/admin/veiculos/novo";

  // Tema claro do painel: a classe vai no <html> (não no wrapper) porque
  // drawers e portais Radix renderizam em document.body.
  useEffect(() => {
    document.documentElement.classList.add("theme-admin");
    return () => document.documentElement.classList.remove("theme-admin");
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login" });
    }
  }, [session, loading, navigate]);

  // Guard por papel: vendedor não acessa telas de dinheiro
  useEffect(() => {
    if (loading || role === "owner") return;
    if (OWNER_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
      navigate({ to: "/admin" });
    }
  }, [role, pathname, loading, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-carbon">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-performance border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-carbon text-clean">
      <AdminSidebar />
      <main
        className={cn(
          "flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden",
          !isNovo && "pb-20 lg:pb-0",
        )}
      >
        <Outlet />
      </main>
      <AdminBottomNav />
    </div>
  );
}
