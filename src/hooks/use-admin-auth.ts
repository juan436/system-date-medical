"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const TOKEN_KEY = "system-date-token";

interface UserProfile {
  id: string;
  email: string;
  rol: string;
}

export function useAdminAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      router.replace("/auth/login?redirect=/admin");
      return;
    }

    api.get<UserProfile>("/auth/profile", { token: stored })
      .then((profile) => {
        if (profile.rol !== "admin") {
          router.replace("/");
          return;
        }
        setToken(stored);
        setVerified(true);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        router.replace("/auth/login?redirect=/admin");
      });
  }, [router]);

  return { token, verified };
}
