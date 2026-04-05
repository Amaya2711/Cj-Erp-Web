import httpClient from "../../../api/httpClient";

const BASE_URL = "/seguridad-permisos";

export interface PermisoMenu {
  idMenu: number;
  nombreMenu: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeAprobar: boolean;
  puedeExportar: boolean;
}

export const seguridadPermisosService = {
  
  // Obtener permisos de un rol
  async obtenerPorRol(idRol: number): Promise<PermisoMenu[]> {
    const response = await httpClient.get(`${BASE_URL}/rol/${idRol}`);
    return response.data;
  },

  // Guardar permisos completos del rol
  async guardarPorRol(idRol: number, permisos: PermisoMenu[]) {
    const response = await httpClient.put(`${BASE_URL}/rol/${idRol}`, permisos);
    return response.data;
  }

};