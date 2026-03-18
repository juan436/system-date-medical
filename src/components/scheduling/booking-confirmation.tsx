"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

interface BookingConfirmationProps {
  serviceName: string;
  date: Date;
  notes: string;
}

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function BookingConfirmation({ serviceName, date, notes }: BookingConfirmationProps) {
  return (
    <GlassCard className="mx-auto max-w-md border-primary/20 bg-primary-light/20">
      <div className="mb-4 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Resumen de tu cita
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-surface/60 px-4 py-3">
          <span className="text-sm text-muted">Servicio</span>
          <Badge>{serviceName}</Badge>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface/60 px-4 py-3">
          <span className="text-sm text-muted">Fecha</span>
          <span className="text-sm font-medium text-foreground">
            {DAY_NAMES[date.getDay()]}, {date.getDate()} de {MONTH_NAMES[date.getMonth()]}
          </span>
        </div>

        {notes && (
          <div className="rounded-xl bg-surface/60 px-4 py-3">
            <span className="text-sm text-muted">Notas</span>
            <p className="mt-1 text-sm text-foreground">{notes}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
