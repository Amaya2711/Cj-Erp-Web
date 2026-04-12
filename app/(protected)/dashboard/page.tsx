const cards = [
  {
    label: "Clientes activos",
    value: "--",
    hint: "Disponible cuando conectes reportes de negocio",
  },
  {
    label: "Cotizaciones del mes",
    value: "--",
    hint: "Modulo preparado para siguiente fase",
  },
  {
    label: "Pedidos en proceso",
    value: "--",
    hint: "Integrable con estados operativos",
  },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Panel principal</p>
        <h2 className="mt-1 text-3xl font-bold text-foreground">Dashboard ERP</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="card-enter rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{card.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{card.hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
