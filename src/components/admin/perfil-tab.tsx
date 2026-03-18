"use client";

import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

interface DoctorProfile {
  id: string;
  nombreCompleto: string;
  titulo: string;
  biografia: string;
  especialidad: string;
  logrosAcademicos: string[];
  experienciaAnios: number;
  fotoPerfil?: string;
}

const ACCEPTED_FORMATS = ".jpg,.jpeg,.png";

export function PerfilTab({ token }: { token: string | null }) {
  const queryClient = useQueryClient();
  const profileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["doctor-profile-admin"],
    queryFn: () => api.get<DoctorProfile | Record<string, never>>("/doctor-profile/admin", { token: token! }),
    enabled: !!token,
    retry: false,
  });

  const [form, setForm] = useState({
    nombreCompleto: "",
    titulo: "",
    biografia: "",
    especialidad: "",
    logrosAcademicos: [""],
    experienciaAnios: 0,
  });
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const hasProfile = profile && "id" in profile;
  if (hasProfile && !initialized) {
    setForm({
      nombreCompleto: profile.nombreCompleto || "",
      titulo: profile.titulo || "",
      biografia: profile.biografia || "",
      especialidad: profile.especialidad || "",
      logrosAcademicos: profile.logrosAcademicos?.length ? profile.logrosAcademicos : [""],
      experienciaAnios: profile.experienciaAnios || 0,
    });
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/doctor-profile/admin", {
        ...form,
        logrosAcademicos: form.logrosAcademicos.filter((l) => l.trim() !== ""),
      }, { token });
      queryClient.invalidateQueries({ queryKey: ["doctor-profile-admin"] });
      setMessage({ type: "success", text: "Perfil guardado correctamente" });
    } catch (err) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const ext = file.name.toLowerCase().split(".").pop();
    if (!["jpg", "jpeg", "png"].includes(ext || "")) {
      setMessage({ type: "error", text: "Solo se permiten imágenes JPG y PNG" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "La imagen no debe superar los 10MB" });
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    // Upload in background
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!token) return;
    setUploading(true);
    setMessage(null);
    try {
      await api.upload("/doctor-profile/admin/foto-perfil", file, { token });
      queryClient.invalidateQueries({ queryKey: ["doctor-profile-admin"] });
      setMessage({ type: "success", text: "Foto de perfil actualizada" });
    } catch (err) {
      setLocalPreview(null);
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  // Determine which image to show: local preview > server image > placeholder
  const serverImage = hasProfile && profile.fotoPerfil ? `${API_BASE}${profile.fotoPerfil}` : null;
  const displayImage = localPreview || serverImage;

  const addLogro = () => setForm((f) => ({ ...f, logrosAcademicos: [...f.logrosAcademicos, ""] }));
  const removeLogro = (idx: number) =>
    setForm((f) => ({ ...f, logrosAcademicos: f.logrosAcademicos.filter((_, i) => i !== idx) }));
  const updateLogro = (idx: number, value: string) =>
    setForm((f) => ({
      ...f,
      logrosAcademicos: f.logrosAcademicos.map((l, i) => (i === idx ? value : l)),
    }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-border/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm ${
          message.type === "success"
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* Foto de perfil */}
      <GlassCard>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Foto de perfil</h3>
        <p className="mb-4 text-xs text-muted">JPG o PNG, máx 10MB. Se recomienda formato retrato.</p>
        <div className="flex items-end gap-6">
          <div className="relative aspect-[3/4] w-40 overflow-hidden rounded-2xl bg-border/20">
            {displayImage ? (
              <>
                <img
                  src={displayImage}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg className="h-16 w-16 text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={profileInputRef}
              type="file"
              accept={ACCEPTED_FORMATS}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = "";
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => profileInputRef.current?.click()}
              disabled={uploading}
            >
              {displayImage ? "Cambiar foto" : "Subir foto"}
            </Button>
            {displayImage && (
              <p className="text-[10px] text-muted">
                {uploading ? "Subiendo..." : localPreview && !serverImage ? "Subida completada" : ""}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Text fields */}
      <GlassCard>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Información del perfil</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="nombreCompleto"
              label="Nombre completo"
              value={form.nombreCompleto}
              onChange={(e) => setForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
              placeholder="Dra. María García"
            />
            <Input
              id="titulo"
              label="Título profesional"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Médico Internista"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="especialidad"
              label="Especialidad"
              value={form.especialidad}
              onChange={(e) => setForm((f) => ({ ...f, especialidad: e.target.value }))}
              placeholder="Medicina Interna"
            />
            <Input
              id="experienciaAnios"
              label="Años de experiencia"
              type="number"
              value={form.experienciaAnios.toString()}
              onChange={(e) => setForm((f) => ({ ...f, experienciaAnios: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label htmlFor="biografia" className="mb-1.5 block text-sm font-medium text-foreground">
              Biografía
            </label>
            <textarea
              id="biografia"
              rows={4}
              value={form.biografia}
              onChange={(e) => setForm((f) => ({ ...f, biografia: e.target.value }))}
              placeholder="Breve descripción sobre ti, tu experiencia y tu enfoque médico..."
              className="w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </GlassCard>

      {/* Logros */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Logros académicos</h3>
          <button
            onClick={addLogro}
            className="text-sm font-medium text-primary hover:underline"
          >
            + Agregar
          </button>
        </div>
        <div className="space-y-3">
          {form.logrosAcademicos.map((logro, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={logro}
                onChange={(e) => updateLogro(idx, e.target.value)}
                placeholder="Ej: Especialización en Medicina Interna"
                className="flex-1 rounded-xl border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {form.logrosAcademicos.length > 1 && (
                <button
                  onClick={() => removeLogro(idx)}
                  className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Guardar perfil
        </Button>
      </div>
    </div>
  );
}
