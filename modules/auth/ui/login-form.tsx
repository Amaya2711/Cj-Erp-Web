"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/services/supabase/browser-client";

const loginSchema = z.object({
  email: z.email("Ingresa un correo valido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
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
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError("No se pudo iniciar sesion. Verifica tus credenciales.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-foreground">Correo corporativo</label>
        <Input type="email" autoComplete="email" placeholder="usuario@empresa.com" {...register("email")} />
        {errors.email ? <p className="mt-1 text-xs text-danger">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-foreground">Contrasena</label>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Ingresa tu contrasena"
          {...register("password")}
        />
        {errors.password ? <p className="mt-1 text-xs text-danger">{errors.password.message}</p> : null}
      </div>

      {serverError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{serverError}</p> : null}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Ingresando..." : "Iniciar sesion"}
      </Button>
    </form>
  );
}
