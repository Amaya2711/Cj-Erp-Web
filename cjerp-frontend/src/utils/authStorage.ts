export type AuthUser = {
  token: string;
  nombre?: string;
  correo?: string;
  usuario?: string;
  codEmp?: string | number;
  codVal?: string | number;
  cuadrilla?: string | number;
};

const STORAGE_KEY = "authUser";

export function saveAuthUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthUser() {
  localStorage.removeItem(STORAGE_KEY);
}