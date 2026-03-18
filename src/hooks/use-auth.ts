"use client";

import { useState, useCallback } from "react";
import { authService, LoginPayload, RegisterPayload, AuthResponse } from "@/services/auth.service";

const TOKEN_KEY = "system-date-token";

export function useAuth() {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  return { user, loading, error, login, register, logout, getToken };
}
