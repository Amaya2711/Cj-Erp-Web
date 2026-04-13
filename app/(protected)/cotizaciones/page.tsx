import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listCotizaciones } from "@/modules/cotizaciones/infrastructure/cotizacion.repository";
import { CotizacionesTable } from "@/modules/cotizaciones/ui/components/cotizaciones-table";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";

export default async function CotizacionesPage() {
  const supabase = createAdminSupabaseClient();
  const cotizaciones = await listCotizaciones(supabase);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Modulo
          </p>
          <h2 className="text-3xl font-bold text-foreground">Cotizaciones</h2>
        </div>
        <Link href="/cotizaciones/nueva">
          <Button>Nueva cotizacion</Button>
        </Link>
      </div>

      <CotizacionesTable cotizaciones={cotizaciones ?? []} />
    </section>
  );
}
