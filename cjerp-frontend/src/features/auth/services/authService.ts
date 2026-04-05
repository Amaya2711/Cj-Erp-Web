import httpClient from "../../../api/httpClient";

export interface LoginRequest {
  idUsuario: string;
  clave: string;
}

export interface LoginData {
  token: string;
  idUsuario: string;
  nombreEmpleado?: string;
  correo?: string;
  codEmp?: string | number | null;
  codVal?: string | number | null;
  cuadrilla?: string | number | null;
  expiration?: string;
}

export interface LoginResponse {
  message: string;
  data: LoginData;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>("/auth/login", payload);
  return data;
}