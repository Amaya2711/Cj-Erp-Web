"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  username: string;
}

export function AppHeader({ username }: AppHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sistema ERP</p>
        <p className="text-sm font-semibold text-foreground">Operacion Comercial</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Usuario</p>
          <p className="text-sm font-semibold text-foreground">{username}</p>
        </div>
        <Button variant="secondary" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}
