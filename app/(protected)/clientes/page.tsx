import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { listClientes } from "@/modules/clientes/infrastructure/cliente.repository";
import { ClientesTable } from "@/modules/clientes/ui/components/clientes-table";
import { createServerSupabaseClient } from "@/services/supabase/server-client";

export default async function ClientesPage() {
  const supabase = await createServerSupabaseClient();
  const clientes = await listClientes(supabase);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Modulo</p>
          <h2 className="text-3xl font-bold text-foreground">Clientes</h2>
        </div>
        <Link href="/clientes/nuevo">
          <Button>Nuevo cliente</Button>
        </Link>
      </div>

      {clientes.length === 0 ? (
        <EmptyState
          title="No existen clientes registrados"
          description="Crea el primer cliente para iniciar el proceso comercial dentro del ERP."
        />
      ) : (
        <ClientesTable clientes={clientes} />
      )}
    </section>
  );
}
