"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/mi-cuenta";
  const { register, loading, error } = useAuth();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  const [validationError, setValidationError] = useState("");

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (form.password !== form.confirmPassword) {
      setValidationError("Las contraseñas no coinciden");
      return;
    }

    if (form.password.length < 8) {
      setValidationError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      await register({
        nombre: form.nombre,
        apellido: form.apellido,
        cedula: form.cedula,
        email: form.email,
        telefono: form.telefono,
        password: form.password,
      });
      router.push(redirect);
    } catch {
      // error handled by useAuth
    }
  };

  const displayError = validationError || error;

  return (
    <GlassCard className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-muted">
          Regístrate para agendar tus citas médicas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="nombre"
            label="Nombre"
            placeholder="María"
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
            required
          />
          <Input
            id="apellido"
            label="Apellido"
            placeholder="García"
            value={form.apellido}
            onChange={(e) => updateField("apellido", e.target.value)}
            required
          />
        </div>

        <Input
          id="cedula"
          label="Cédula"
          placeholder="12345678"
          value={form.cedula}
          onChange={(e) => updateField("cedula", e.target.value)}
          required
        />

        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
        />

        <Input
          id="telefono"
          label="Teléfono"
          type="tel"
          placeholder="+57 300 123 4567"
          value={form.telefono}
          onChange={(e) => updateField("telefono", e.target.value)}
          required
        />

        <Input
          id="password"
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
        />

        <Input
          id="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          value={form.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          required
        />

        {displayError && (
          <p className="text-sm text-red-500">{displayError}</p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/auth/login${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-medium text-primary hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </GlassCard>
  );
}

export default function RegistroPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center bg-background px-4 pt-24 pb-12">
        <Suspense>
          <RegistroForm />
        </Suspense>
      </main>
    </>
  );
}
