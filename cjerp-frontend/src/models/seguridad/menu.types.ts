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
}

export interface MenuNode extends MenuDto {
  hijos: MenuNode[];
}