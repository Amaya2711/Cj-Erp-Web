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
        Relationships: [];
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
        Relationships: [];
      };
      detalle_cotizacion: {
        Row: {
          id_cotizacion: string;
          correlativo: number;
          cantidad: number;
          descripcion: string;
          precio_unitario: number;
          total: number;
          estado: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          id_cotizacion: string;
          correlativo: number;
          cantidad: number;
          descripcion: string;
          precio_unitario: number;
          total: number;
          estado?: boolean;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          cantidad?: number;
          descripcion?: string;
          precio_unitario?: number;
          total?: number;
          estado?: boolean;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      moneda: {
        Row: {
          id_moneda: string;
          nombre_moneda: string;
          simbolo: string | null;
          estado: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          id_moneda?: string;
          nombre_moneda: string;
          simbolo?: string | null;
          estado?: boolean;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          nombre_moneda?: string;
          simbolo?: string | null;
          estado?: boolean;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      tipo_pago: {
        Row: {
          id_tipo: string;
          forma_pago: string;
          estado: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          id_tipo?: string;
          forma_pago: string;
          estado?: boolean;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          forma_pago?: string;
          estado?: boolean;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      estado: {
        Row: {
          id_estado: number;
          nombre_estado: string;
          estado: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          id_estado: number;
          nombre_estado: string;
          estado?: boolean;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          nombre_estado?: string;
          estado?: boolean;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      usuario: {
        Row: {
          id_usuario: string;
          id_empleado: string;
          nombre_usuario: string;
          correo: string | null;
          clave: string;
          estado: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          id_usuario?: string;
          id_empleado: string;
          nombre_usuario: string;
          correo?: string | null;
          clave: string;
          estado?: boolean;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id_empleado?: string;
          nombre_usuario?: string;
          correo?: string | null;
          clave?: string;
          estado?: boolean;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
