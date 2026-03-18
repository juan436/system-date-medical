import { api } from "@/lib/api";

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  whatsapp?: string;
  fechaNacimiento?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
  accessToken: string;
}

export const authService = {
  register: (data: RegisterPayload) => api.post<AuthResponse>("/auth/register", data),
  login: (data: LoginPayload) => api.post<AuthResponse>("/auth/login", data),
  getProfile: (token: string) => api.get("/auth/profile", { token }),
};
