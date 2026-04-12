"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clienteSchema, type ClienteFormValues } from "@/modules/clientes/domain/schemas/cliente.schema";
import type { ClienteRow } from "@/modules/clientes/domain/types";

interface ClienteFormProps {
  mode: "create" | "update";
  initialData?: ClienteRow;
}

export function ClienteForm({ mode, initialData }: ClienteFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: initialData?.nombre ?? "",
      ruc: initialData?.ruc ?? "",
      direccion: initialData?.direccion ?? "",
      telefono: initialData?.telefono ?? "",
      estado: initialData?.estado ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const endpoint = mode === "create" ? "/api/clientes" : `/api/clientes/${initialData?.id_cliente}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setServerError("No se pudo guardar la informacion del cliente.");
      return;
    }

    router.replace("/clientes");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-border bg-surface p-6 shadow-sm card-enter">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">Nombre</label>
          <Input placeholder="Razon social o nombre comercial" {...register("nombre")} />
          {errors.nombre ? <p className="mt-1 text-xs text-danger">{errors.nombre.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">RUC</label>
          <Input placeholder="Numero de RUC" {...register("ruc")} />
          {errors.ruc ? <p className="mt-1 text-xs text-danger">{errors.ruc.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">Direccion</label>
          <Input placeholder="Direccion fiscal" {...register("direccion")} />
          {errors.direccion ? <p className="mt-1 text-xs text-danger">{errors.direccion.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">Telefono</label>
          <Input placeholder="Telefono de contacto" {...register("telefono")} />
          {errors.telefono ? <p className="mt-1 text-xs text-danger">{errors.telefono.message}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="estado"
          type="checkbox"
          className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
          {...register("estado")}
        />
        <label htmlFor="estado" className="text-sm text-foreground">
          Cliente activo
        </label>
      </div>

      {serverError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{serverError}</p> : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : mode === "create" ? "Crear cliente" : "Actualizar cliente"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/clientes")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
