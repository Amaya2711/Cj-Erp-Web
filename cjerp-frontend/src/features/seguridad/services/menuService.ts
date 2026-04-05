import httpClient from "../../../api/httpClient";
import type { MenuDto } from "../../../models/seguridad/menu.types";

const BASE_URL = "/menu";

export interface GuardarAsignacionMenuRolRequest {
  idRol: number;
  menuIds: number[];
}

export const menuService = {
  async obtenerPorUsuario(idUsuario: string): Promise<MenuDto[]> {
    const response = await httpClient.get(`${BASE_URL}/usuario/${encodeURIComponent(idUsuario)}`);
    return response.data;
  },

  async obtenerPorRol(idRol: number): Promise<MenuDto[]> {
    const response = await httpClient.get(`${BASE_URL}/rol/${idRol}/asignado`);
    return response.data;
  },

  async obtenerCompleto(): Promise<MenuDto[]> {
    const response = await httpClient.get(`${BASE_URL}/completo`);
    return response.data;
  },

  async guardarAsignacionMenuRol(payload: GuardarAsignacionMenuRolRequest) {
    const response = await httpClient.post(`${BASE_URL}/rol/asignacion`, payload);
    return response.data;
  }
};

export type { MenuDto };