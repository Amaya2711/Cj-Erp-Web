import httpClient from "../../../api/httpClient";

const BASE_URL = "/perfiles";

export interface RolDto {
  idRol: number;
  idPerfil?: number;
  nombreRol: string;
  descripcion?: string;
  estado?: boolean;
}

export const rolesService = {
  async listarRolesPorPerfil(idPerfil: number): Promise<RolDto[]> {
    const response = await httpClient.get(`${BASE_URL}/${idPerfil}/roles`);
    return response.data;
  }
};
