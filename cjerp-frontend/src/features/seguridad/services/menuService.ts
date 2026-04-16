// Consulta si existe la relación usuario-perfil
export interface ExisteUsuarioPerfilRequest {
  idUsuario: string;
  idPerfil: number;
}

export interface GuardarUsuarioPerfilRequest {
  idUsuario: string;
  idPerfil: number;
}

import httpClient from "../../../api/httpClient";
import type { MenuDto } from "../../../models/seguridad/menu.types";

const BASE_URL = "/menu";

export interface GuardarAsignacionMenuRolRequest {
  idPerfil: number;
  idRol: number;
  menus: { idMenu: number; acceso: boolean }[];
}

export interface CrearMenuPrincipalRequest {
  nombreMenu: string;
  idMenuPadre?: number;
  ruta?: string;
  codigoMenu?: string;
  icono?: string;
  ordenMenu: number;
  esVisible: boolean;
  esActivo: boolean;
}

export interface SincronizarPerfilUsuarioRequest {
  idPerfil: number;
  idUsuario: string;
}

export interface GuardarUsuarioPerfilRolRequest {
  idUsuario: string;
  idPerfil: number;
  idRol: number;
}

export const menuService = {

    async existeUsuarioPerfil({ idUsuario, idPerfil }: ExisteUsuarioPerfilRequest): Promise<boolean> {
      const response = await httpClient.get(`${BASE_URL}/usuario-perfil/existe`, {
        params: { idUsuario, idPerfil }
      });
      return !!response.data?.existe;
    },

    async guardarUsuarioPerfil(payload: GuardarUsuarioPerfilRequest) {
      // Suponiendo que existe un endpoint POST /menu/usuario-perfil para crear la relación
      // Si no existe, deberás implementarlo en el backend
      const response = await httpClient.post(`${BASE_URL}/usuario-perfil`, payload);
      return response.data;
    },
  async obtenerMenuDinamicoPorUsuario(idUsuario: string): Promise<MenuDto[]> {
    const response = await httpClient.get(`${BASE_URL}/dinamico`, {
      params: { IdUsuario: idUsuario }
    });
    return response.data;
  },

  async obtenerPorPerfilRol(idPerfil: number, idRol: number): Promise<MenuDto[]> {
    const response = await httpClient.get(`${BASE_URL}/perfil/${idPerfil}/rol/${idRol}/asignado`);
    return response.data;
  },

  async obtenerCompleto(): Promise<MenuDto[]> {
    const response = await httpClient.get(`${BASE_URL}/completo`);
    return response.data;
  },

  async obtenerDinamicoTotal(): Promise<MenuDto[]> {
    const response = await httpClient.get(`${BASE_URL}/dinamico-total`);
    return response.data;
  },

  async obtenerDinamicoPorPerfil(idPerfil: number): Promise<MenuDto[]> {
    const response = await httpClient.get(`${BASE_URL}/perfil/${idPerfil}/dinamico`);
    return response.data;
  },

  async guardarAsignacionMenuRol(payload: GuardarAsignacionMenuRolRequest) {
    const response = await httpClient.post(`${BASE_URL}/rol/asignacion`, payload);
    return response.data;
  },

  async guardarUsuarioPerfilRol(payload: GuardarUsuarioPerfilRolRequest) {
    const response = await httpClient.post(`${BASE_URL}/usuario-perfil-rol`, payload);
    return response.data;
  },

  async crearMenuPrincipal(payload: CrearMenuPrincipalRequest) {
    const response = await httpClient.post(`${BASE_URL}/principal`, payload);
    return response.data;
  },

  async crearNodo(payload: CrearMenuPrincipalRequest) {
    try {
      const response = await httpClient.post(`${BASE_URL}/nodo`, payload);
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const esNodoPrincipal = payload.idMenuPadre == null;

      if (status === 404 && esNodoPrincipal) {
        // Backward compatibility when API still exposes only /menu/principal.
        const response = await httpClient.post(`${BASE_URL}/principal`, payload);
        return response.data;
      }

      if (status === 404 && !esNodoPrincipal) {
        throw new Error(
          "El API no tiene habilitado POST /menu/nodo. Actualice/reinicie el backend para crear nodos secundarios o de tercer nivel."
        );
      }

      throw error;
    }
  },

  async sincronizarPerfilUsuario(payload: SincronizarPerfilUsuarioRequest) {
    const response = await httpClient.post(`${BASE_URL}/perfil-usuario/sincronizar`, payload);
    return response.data;
  }
};

export type { MenuDto };