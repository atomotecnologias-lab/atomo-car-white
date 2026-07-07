import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { FinanceEntriesScreen } from "@/components/admin/FinanceEntriesScreen";

export const Route = createFileRoute("/admin/financeiro/receber")({
  component: ReceivablesPage,
});

function ReceivablesPage() {
  return (
    <>
      <AdminTopbar
        title="Contas a receber"
        subtitle="Valores a entrar — vendas e outros recebimentos"
      />
      <FinanceEntriesScreen kind="receivable" />
    </>
  );
}
