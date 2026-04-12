import { notFound } from "next/navigation";

import { getClienteById } from "@/modules/clientes/infrastructure/cliente.repository";
import { ClienteForm } from "@/modules/clientes/ui/forms/cliente-form";
import { createServerSupabaseClient } from "@/services/supabase/server-client";

interface EditarClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: EditarClientePageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  let cliente;

  try {
    cliente = await getClienteById(supabase, id);
  } catch {
    notFound();
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Clientes</p>
        <h2 className="text-3xl font-bold text-foreground">Editar cliente</h2>
      </div>
      <ClienteForm mode="update" initialData={cliente} />
    </section>
  );
}
