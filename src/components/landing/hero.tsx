"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api, IMAGE_BASE_URL } from "@/lib/api";

interface DoctorProfile {
  nombreCompleto: string;
  titulo: string;
  especialidad: string;
  biografia: string;
  experienciaAnios: number;
  fotoPerfil?: string;
}

export function Hero() {
  const { data: doctor } = useQuery({
    queryKey: ["doctor-profile-public"],
    queryFn: () => api.get<DoctorProfile>("/doctor-profile"),
  });

  const name = doctor?.nombreCompleto || "Dra. María García";
  const title = doctor?.titulo || "Médico Internista";
  const specialty = doctor?.especialidad || "Medicina Interna";

  return (
    <section className="relative min-h-[90vh] overflow-hidden pt-20">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl items-center px-4 sm:px-6">
        <div className="grid min-h-[calc(90vh-5rem)] w-full items-center gap-8 md:grid-cols-2 lg:gap-16">
          {/* Left: Text content */}
          <div className="order-2 pb-12 md:order-1 md:py-20">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-primary">
                {specialty}
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {name}
            </h1>

            <p className="mt-3 text-lg font-medium text-primary/80 md:text-xl">
              {title}
            </p>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">
              {doctor?.biografia
                ? doctor.biografia.length > 160
                  ? doctor.biografia.slice(0, 160).trim() + "..."
                  : doctor.biografia
                : "Atención médica personalizada con los más altos estándares de calidad. Tu bienestar es mi prioridad."}
            </p>

            {/* Stats inline */}
            <div className="mt-8 flex items-center gap-6 border-l-2 border-primary/20 pl-6">
              <div>
                <p className="font-display text-3xl font-bold text-primary">
                  {doctor?.experienciaAnios || 15}+
                </p>
                <p className="text-xs text-muted">Años de experiencia</p>
              </div>
              <div className="h-10 w-px bg-border/60" />
              <div>
                <p className="font-display text-3xl font-bold text-primary">5000+</p>
                <p className="text-xs text-muted">Pacientes atendidos</p>
              </div>
              <div className="h-10 w-px bg-border/60" />
              <div>
                <p className="font-display text-3xl font-bold text-primary">98%</p>
                <p className="text-xs text-muted">Satisfacción</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/agendar">
                <Button size="lg" className="group">
                  Agendar mi cita
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
              <a href="#sobre-mi">
                <Button variant="outline" size="lg">Conocer más</Button>
              </a>
            </div>
          </div>

          {/* Right: Doctor photo */}
          <div className="relative order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative w-full max-w-[380px] lg:max-w-[440px]">
              {/* Decorative ring */}
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-sm" />

              {/* Photo container */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary-light to-accent shadow-2xl shadow-primary/10">
                {doctor?.fotoPerfil ? (
                  <img
                    src={`${IMAGE_BASE_URL}${doctor.fotoPerfil}`}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-40 w-40 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                )}

                {/* Gradient overlay at bottom of photo */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 rounded-2xl border border-border/50 bg-surface/90 p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.746 3.746 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Profesional Verificada</p>
                    <p className="text-[10px] text-muted">Colegio Médico Nacional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full text-background" preserveAspectRatio="none">
          <path d="M0 60V20C240 50 480 60 720 40C960 20 1200 30 1440 50V60H0Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
