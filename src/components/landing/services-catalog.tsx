"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ServiceItem {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  precioReferencial: number;
}

const fallbackServices: ServiceItem[] = [
  { id: "1", nombre: "Consulta General", descripcion: "Evaluación médica integral con diagnóstico personalizado y plan de tratamiento.", duracionMinutos: 30, precioReferencial: 0 },
  { id: "2", nombre: "Control de Seguimiento", descripcion: "Revisión de tratamientos, evolución del paciente y ajuste de indicaciones.", duracionMinutos: 20, precioReferencial: 0 },
  { id: "3", nombre: "Evaluación Especializada", descripcion: "Consulta enfocada en condiciones específicas con análisis detallado.", duracionMinutos: 45, precioReferencial: 0 },
];

const serviceIcons = [
  // Stethoscope
  <svg key="0" className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>,
  // Heart
  <svg key="1" className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>,
  // Clipboard
  <svg key="2" className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>,
  // Shield
  <svg key="3" className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
  // Sparkle
  <svg key="4" className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>,
];

export function ServicesCatalog() {
  const [services, setServices] = useState<ServiceItem[]>(fallbackServices);

  useEffect(() => {
    api.get<ServiceItem[]>("/services")
      .then(setServices)
      .catch(() => {});
  }, []);

  return (
    <section id="servicios" className="relative py-20 md:py-32 bg-surface/30">
      {/* Decorative */}
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-primary/3 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-16 max-w-2xl">
          <Badge variant="info" className="mb-4">Servicios médicos</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Atención integral para{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              tu bienestar
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted">
            Cada consulta está diseñada para ofrecerte la mejor experiencia médica,
            con atención personalizada y seguimiento continuo.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <div
              key={service.id}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-surface/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-[0_8px_40px_rgba(77,168,160,0.08)] hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary transition-colors group-hover:from-primary group-hover:to-primary/80 group-hover:text-white">
                {serviceIcons[i % serviceIcons.length]}
              </div>

              <h3 className="font-display text-lg font-bold text-foreground">
                {service.nombre}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted">
                {service.descripcion}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {service.duracionMinutos} minutos
                </div>
                <Link href="/agendar" className="text-xs font-semibold text-primary transition-colors hover:text-primary/80">
                  Agendar →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/agendar">
            <Button size="lg" className="group">
              Agendar una cita ahora
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
