import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ActivityFeed } from "@/components/admin/ActivityFeed";

export const Route = createFileRoute("/admin/atividade")({
  component: ActivityPage,
});

function ActivityPage() {
  return (
    <>
      <AdminTopbar
        title="Atividade"
        subtitle="Quem fez o quê na loja — vendas, custos, lançamentos e edições"
      />
      <div className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
        <ActivityFeed limit={100} />
      </div>
    </>
  );
}
