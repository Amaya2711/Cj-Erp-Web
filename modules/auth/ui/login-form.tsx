"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  nombre_usuario: z.string().min(1, "Ingresa tu usuario"),
  clave: z.string().min(1, "Ingresa tu clave"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nombre_usuario: "",
      clave: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setServerError("No se pudo iniciar sesion. Verifica tus credenciales.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-foreground">Usuario</label>
        <Input type="text" autoComplete="username" placeholder="Ingresa tu usuario" {...register("nombre_usuario")} />
        {errors.nombre_usuario ? <p className="mt-1 text-xs text-danger">{errors.nombre_usuario.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-foreground">Contrasena</label>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Ingresa tu contrasena"
          {...register("clave")}
        />
        {errors.clave ? <p className="mt-1 text-xs text-danger">{errors.clave.message}</p> : null}
      </div>

      {serverError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{serverError}</p> : null}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Ingresando..." : "Iniciar sesion"}
      </Button>
    </form>
  );
}
