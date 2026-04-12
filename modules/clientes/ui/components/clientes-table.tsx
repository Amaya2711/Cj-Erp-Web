"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ClienteRow } from "@/modules/clientes/domain/types";

interface ClientesTableProps {
  clientes: ClienteRow[];
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete(idCliente: string) {
    const confirmed = window.confirm("Esta accion eliminara el cliente de forma permanente. Deseas continuar?");
    if (!confirmed) return;

    setBusyId(idCliente);
    setErrorMessage(null);
    setMessage(null);

    const response = await fetch(`/api/clientes/${idCliente}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setErrorMessage("No se pudo eliminar el cliente.");
      setBusyId(null);
      return;
    }

    setMessage("Cliente eliminado correctamente.");
    setBusyId(null);
    router.refresh();
  }

  async function handleToggleStatus(cliente: ClienteRow) {
    setBusyId(cliente.id_cliente);
    setErrorMessage(null);
    setMessage(null);

    const response = await fetch(`/api/clientes/${cliente.id_cliente}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: cliente.nombre,
        ruc: cliente.ruc,
        direccion: cliente.direccion ?? "",
        telefono: cliente.telefono ?? "",
        estado: !cliente.estado,
      }),
    });

    if (!response.ok) {
      setErrorMessage("No se pudo actualizar el estado del cliente.");
      setBusyId(null);
      return;
    }

    setMessage("Estado actualizado correctamente.");
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success">{message}</p> : null}
      {errorMessage ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{errorMessage}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-strong text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">RUC</th>
              <th className="px-4 py-3">Telefono</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id_cliente} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">{cliente.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground">{cliente.ruc}</td>
                <td className="px-4 py-3 text-muted-foreground">{cliente.telefono ?? "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge active={cliente.estado} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/clientes/${cliente.id_cliente}`}>
                      <Button variant="secondary">Editar</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => void handleToggleStatus(cliente)}
                      disabled={busyId === cliente.id_cliente}
                    >
                      {cliente.estado ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => void handleDelete(cliente.id_cliente)}
                      disabled={busyId === cliente.id_cliente}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
