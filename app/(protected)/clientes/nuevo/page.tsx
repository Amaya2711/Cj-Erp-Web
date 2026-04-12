import { ClienteForm } from "@/modules/clientes/ui/forms/cliente-form";

export default function NuevoClientePage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Clientes</p>
        <h2 className="text-3xl font-bold text-foreground">Nuevo cliente</h2>
      </div>
      <ClienteForm mode="create" />
    </section>
  );
}
