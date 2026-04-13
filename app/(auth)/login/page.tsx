import { redirect } from "next/navigation";

import { LoginForm } from "@/modules/auth/ui/login-form";
import { getServerAuthSession } from "@/services/auth/session";

export default async function LoginPage() {
  const user = await getServerAuthSession();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-primary p-10 text-white lg:block">
        <div className="absolute -left-16 top-8 h-60 w-60 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-blue-950/40 blur-3xl" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">AGH Platform</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">ERP modular para operacion comercial y financiera</h1>
          </div>
          <p className="max-w-md text-sm text-cyan-100/90">
            Gestiona clientes, cotizaciones, pedidos y reportes en una arquitectura lista para produccion.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="card-enter w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Acceso seguro</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Iniciar sesion</h2>
          <p className="mt-1 text-sm text-muted-foreground">Autenticacion con usuarios internos del ERP.</p>

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
