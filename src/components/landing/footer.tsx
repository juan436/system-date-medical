"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface DoctorProfile {
  nombreCompleto: string;
  especialidad: string;
}

export function Footer() {
  const { data: doctor } = useQuery({
    queryKey: ["doctor-profile-public"],
    queryFn: () => api.get<DoctorProfile>("/doctor-profile"),
  });

  const name = doctor?.nombreCompleto || "Consultorio Médico";
  const specialty = doctor?.especialidad || "Medicina General";

  return (
    <footer className="relative border-t border-border/40">
      {/* CTA section */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Tu salud no puede esperar
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Agenda tu cita hoy y recibe la atención personalizada que mereces.
          </p>
          <Link href="/agendar">
            <Button size="lg" className="mt-6 group">
              Agendar mi cita
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer content */}
      <div className="bg-surface/30 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">{name}</p>
                <p className="text-xs text-muted">{specialty}</p>
              </div>
            </div>

            <div className="flex gap-8 text-sm text-muted">
              <a href="#servicios" className="transition-colors hover:text-foreground">Servicios</a>
              <a href="#sobre-mi" className="transition-colors hover:text-foreground">Sobre Mí</a>
              <a href="#resenas" className="transition-colors hover:text-foreground">Reseñas</a>
            </div>
          </div>

          <div className="mt-8 border-t border-border/40 pt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} {name}. Todos los derechos reservados.
            </p>
            <p className="text-xs text-muted/60">
              Powered by SystemDate
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
