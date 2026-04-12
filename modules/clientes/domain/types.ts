import type { Database } from "@/types/database";

export type ClienteRow = Database["public"]["Tables"]["cliente"]["Row"];
export type ClienteInsert = Database["public"]["Tables"]["cliente"]["Insert"];
export type ClienteUpdate = Database["public"]["Tables"]["cliente"]["Update"];
