"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });

      // If there's an explicit redirect, use it
      if (redirect) {
        router.push(redirect);
        return;
      }

      // Otherwise, redirect based on role
      if (response.user.rol === "admin") {
        router.push("/admin");
      } else {
        router.push("/mi-cuenta");
      }
    } catch {
      // error handled by useAuth
    }
  };

  return (
    <GlassCard className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Bienvenido de vuelta
        </h1>
        <p className="mt-2 text-sm text-muted">
          Ingresa a tu cuenta para gestionar tus citas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Iniciar Sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href={`/auth/registro${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-medium text-primary hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center bg-background px-4 pt-20">
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
