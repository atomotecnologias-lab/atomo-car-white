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
    meta: [{ title: "Primos Central de Operações e Inteligência" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isNovo = pathname === "/admin/veiculos/novo";

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login" });
    }
  }, [session, loading, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-carbon">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-performance border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-carbon text-clean">
      <AdminSidebar />
      <main className={cn("flex min-h-screen min-w-0 flex-1 flex-col", !isNovo && "pb-20 lg:pb-0")}>
        <Outlet />
      </main>
      <AdminBottomNav />
    </div>
  );
}
