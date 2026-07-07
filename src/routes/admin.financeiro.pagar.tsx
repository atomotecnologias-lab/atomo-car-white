import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { FinanceEntriesScreen } from "@/components/admin/FinanceEntriesScreen";

export const Route = createFileRoute("/admin/financeiro/pagar")({
  component: PayablesPage,
});

function PayablesPage() {
  return (
    <>
      <AdminTopbar
        title="Contas a pagar"
        subtitle="Compromissos da loja — vencidas, hoje e próximas"
      />
      <FinanceEntriesScreen kind="payable" />
    </>
  );
}
