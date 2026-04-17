export interface MenuDto {
  idMenu: number;
  idMenuPadre?: number | null;
  nombreMenu: string;
  ruta?: string | null;
  icono?: string | null;
  ordenMenu: number;
  nivelMenu: number;
  codigoMenu?: string | null;
  esVisible: boolean;
  esActivo: boolean;
  esNodoPrincipal: boolean;
  acceso: number;
}

export interface MenuNode extends MenuDto {
  hijos: MenuNode[];
}