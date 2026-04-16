import axios from "axios";
import { getAuthUser, clearAuthUser } from "../utils/authStorage";

const apiBaseUrl =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5015/api";

const httpClient = axios.create({
  baseURL: apiBaseUrl,
});

httpClient.interceptors.request.use((config) => {
  const requestUrl = config.url?.toLowerCase() ?? "";

  // En login no enviar token
  if (requestUrl.includes("/auth/login")) {
    return config;
  }

  const authUser = getAuthUser();

  if (authUser?.token) {
    config.headers.Authorization = `Bearer ${authUser.token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthUser();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default httpClient;