import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/services/auth/session";
import { buildCotizacionPdf } from "@/services/cotizaciones/delivery";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
  const supabase = createAdminSupabaseClient();
    const { pdfBytes, filename } = await buildCotizacionPdf(supabase, id);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "Error al generar PDF" }, { status: 500 });
  }
}
