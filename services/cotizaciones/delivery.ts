import nodemailer from "nodemailer";

import { getPrivateEnv } from "@/lib/env";
import { getCotizacionDocumentoById } from "@/modules/cotizaciones/infrastructure/cotizacion.repository";
import type { AuthSession } from "@/services/auth/session";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

import { generateCotizacionPdf, getCotizacionPdfFilename } from "@/services/cotizaciones/pdf";

function getDeliveryConfig() {
  const env = getPrivateEnv();

  if (
    !env.SMTP_HOST ||
    !env.SMTP_PORT ||
    !env.SMTP_USER ||
    !env.SMTP_PASS ||
    !env.SMTP_FROM_EMAIL
  ) {
    return null;
  }

  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    fromEmail: env.SMTP_FROM_EMAIL,
    fromName: env.SMTP_FROM_NAME ?? "AGH ERP",
  };
}

async function getRecipientEmail(
  supabase: SupabaseClient<Database>,
  user: Pick<AuthSession, "userId" | "email">
) {
  if (user.email) {
    return user.email;
  }

  const { data, error } = await supabase
    .from("usuario")
    .select("correo")
    .eq("id_usuario", user.userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.correo;
}

export async function buildCotizacionPdf(
  supabase: SupabaseClient<Database>,
  idCotizacion: string
) {
  const cotizacion = await getCotizacionDocumentoById(supabase, idCotizacion);
  const pdfBytes = await generateCotizacionPdf(cotizacion);

  return {
    cotizacion,
    pdfBytes,
    filename: getCotizacionPdfFilename(cotizacion),
  };
}

export async function sendCotizacionByEmail(
  supabase: SupabaseClient<Database>,
  idCotizacion: string,
  user: Pick<AuthSession, "userId" | "email">
): Promise<{
  emailSent: boolean;
  recipient: string | null;
  emailError: string | undefined;
}> {
  const config = getDeliveryConfig();

  if (!config) {
    return {
      emailSent: false,
      recipient: null,
      emailError: "Configuracion SMTP incompleta.",
    };
  }

  const recipient = await getRecipientEmail(supabase, user);

  if (!recipient) {
    return {
      emailSent: false,
      recipient: null,
      emailError: "El usuario autenticado no tiene correo registrado.",
    };
  }

  const { cotizacion, pdfBytes, filename } = await buildCotizacionPdf(supabase, idCotizacion);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: `${config.fromName} <${config.fromEmail}>`,
    to: recipient,
    subject: `Cotizacion ${filename.replace(/\.pdf$/i, "")}`,
    text: [
      "Se adjunta la cotizacion generada automaticamente por AGH ERP.",
      `Cliente: ${cotizacion.cliente?.nombre ?? "-"}`,
      `Fecha: ${cotizacion.fecha}`,
      `Total: ${cotizacion.total.toFixed(2)}`,
    ].join("\n"),
    attachments: [
      {
        filename,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ],
  });

  return {
    emailSent: true,
    recipient,
    emailError: undefined,
  };
}
