export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cliente: {
        Row: {
          id_cliente: string;
          nombre: string;
          ruc: string;
          direccion: string | null;
          telefono: string | null;
          estado: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          id_cliente?: string;
          nombre: string;
          ruc: string;
          direccion?: string | null;
          telefono?: string | null;
          estado?: boolean;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          nombre?: string;
          ruc?: string;
          direccion?: string | null;
          telefono?: string | null;
          estado?: boolean;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
      cotizacion: {
        Row: {
          id_cotizacion: string;
          anio: number;
          id_cliente: string;
          fecha: string;
          id_pago: string;
          id_moneda: string;
          valido_dias: number;
          entrega_horas: number;
          subtotal: number;
          igv: number;
          total_previo: number;
          detraccion: number;
          total: number;
          dias_credito: number | null;
          id_estado: number;
          estado: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          id_cotizacion?: string;
          anio: number;
          id_cliente: string;
          fecha: string;
          id_pago: string;
          id_moneda: string;
          valido_dias: number;
          entrega_horas: number;
          subtotal: number;
          igv: number;
          total_previo: number;
          detraccion: number;
          total: number;
          dias_credito?: number | null;
          id_estado: number;
          estado?: boolean;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          anio?: number;
          id_cliente?: string;
          fecha?: string;
          id_pago?: string;
          id_moneda?: string;
          valido_dias?: number;
          entrega_horas?: number;
          subtotal?: number;
          igv?: number;
          total_previo?: number;
          detraccion?: number;
          total?: number;
          dias_credito?: number | null;
          id_estado?: number;
          estado?: boolean;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
