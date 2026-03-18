"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

interface DoctorProfile {
  nombreCompleto: string;
  titulo: string;
  biografia: string;
  especialidad: string;
  logrosAcademicos: string[];
  experienciaAnios: number;
  fotoPerfil?: string;
}

const defaultAchievements = [
  "Medicina General — Universidad Nacional",
  "Especialización en Medicina Interna",
  "Diplomado en Gestión de Salud",
  "Miembro del Colegio Médico Nacional",
];

export function AboutDoctor() {
  const { data: doctor } = useQuery({
    queryKey: ["doctor-profile-public"],
    queryFn: () => api.get<DoctorProfile>("/doctor-profile"),
  });

  const name = doctor?.nombreCompleto || "Dra. María García";
  const bio = doctor?.biografia ||
    "Con más de 15 años de experiencia brindando atención médica de calidad. Mi compromiso es ofrecer un servicio cercano, humano y basado en la evidencia científica más actualizada.";
  const achievements = doctor?.logrosAcademicos?.length ? doctor.logrosAcademicos : defaultAchievements;

  return (
    <section id="sobre-mi" className="relative overflow-hidden py-20 md:py-32">
      {/* Decorative backgrounds */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <Badge variant="info" className="mb-4">Conoce a tu doctora</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Experiencia y dedicación{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              a tu servicio
            </span>
          </h2>
        </div>

        <div className="grid items-center gap-16 lg:grid-cols-5">
          {/* Left: Photo with overlapping card */}
          <div className="relative mx-auto w-full max-w-sm lg:col-span-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl shadow-primary/10">
              {doctor?.fotoPerfil ? (
                <img
                  src={`${API_BASE}${doctor.fotoPerfil}`}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-light to-accent">
                  <svg className="h-32 w-32 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-2xl border-2 border-primary/10 -z-10" />
            <div className="absolute -top-4 -left-4 h-20 w-20 rounded-xl bg-primary/5 -z-10" />
          </div>

          {/* Right: Bio content */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {name}
            </h3>

            {doctor?.titulo && (
              <p className="mt-2 text-base font-semibold text-primary">{doctor.titulo}</p>
            )}

            <div className="mt-6 space-y-4">
              {bio.split(". ").reduce<string[]>((acc, sentence, i, arr) => {
                // Group sentences into paragraphs of ~2 sentences
                const idx = Math.floor(i / 2);
                acc[idx] = (acc[idx] || "") + sentence + (i < arr.length - 1 ? ". " : "");
                return acc;
              }, []).map((paragraph, i) => (
                <p key={i} className="text-base leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Achievements */}
            <div className="mt-10">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/60">
                Formación y logros
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {achievements.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl bg-surface/60 p-3 border border-border/30">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <svg className="h-3.5 w-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
