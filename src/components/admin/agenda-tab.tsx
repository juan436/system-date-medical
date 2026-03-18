"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { exportToCsv } from "@/lib/csv-export";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteTelefono: string;
  servicioId: string;
  servicioNombre: string;
  fechaCita: string;
  estado: string;
  notasPaciente?: string;
}

const statusVariant: Record<string, "default" | "success" | "warning" | "info"> = {
  pendiente: "warning",
  confirmada: "info",
  completada: "success",
  cancelada: "default",
  reprogramada: "warning",
};

const statusLabel: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  reprogramada: "Reprogramada",
};

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AgendaTab() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [weekOffset, setWeekOffset] = useState(0);
  const token = typeof window !== "undefined" ? localStorage.getItem("system-date-token") : null;
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["admin-appointments", selectedDate],
    queryFn: () =>
      api.get<Appointment[]>(`/admin/appointments?date=${selectedDate}`, { token: token! }),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch<Appointment>(`/admin/appointments/${id}/${action}`, {}, { token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments", selectedDate] });
    },
  });

  const handleExportCsv = () => {
    exportToCsv(`agenda-${selectedDate}.csv`, appointments.map((a) => ({
      Paciente: a.pacienteNombre,
      Teléfono: a.pacienteTelefono,
      Servicio: a.servicioNombre,
      Estado: statusLabel[a.estado] || a.estado,
      Notas: a.notasPaciente || "",
    })));
  };

  // Generate week dates for quick navigation based on weekOffset
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7 + i);
    return d;
  });

  const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const activeAppointments = appointments.filter((a) => a.estado !== "cancelada");
  const pendingCount = appointments.filter((a) => a.estado === "pendiente").length;

  const weekRangeLabel = `${weekDates[0].getDate()} ${MONTH_SHORT[weekDates[0].getMonth()]} - ${weekDates[6].getDate()} ${MONTH_SHORT[weekDates[6].getMonth()]}`;

  const goToPrevWeek = () => setWeekOffset((o) => o - 1);
  const goToNextWeek = () => setWeekOffset((o) => o + 1);
  const goToToday = () => {
    setWeekOffset(0);
    setSelectedDate(formatDate(new Date()));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Agenda</h1>
          <p className="mt-1 text-sm text-muted">
            {activeAppointments.length} citas para este día
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-600">({pendingCount} por confirmar)</span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar CSV
        </Button>
      </div>

      {/* Week quick nav */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevWeek}
              className="rounded-lg border border-border bg-surface p-2 text-muted transition-colors hover:border-primary/30 hover:text-foreground"
              title="Semana anterior"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="text-sm font-medium text-muted">{weekRangeLabel}</span>
            <button
              onClick={goToNextWeek}
              className="rounded-lg border border-border bg-surface p-2 text-muted transition-colors hover:border-primary/30 hover:text-foreground"
              title="Semana siguiente"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            {weekOffset !== 0 && (
              <Button variant="outline" size="sm" onClick={goToToday} className="ml-1 text-xs">
                Hoy
              </Button>
            )}
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
                // Calculate week offset so the selected date appears in the week nav
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const [y, m, d] = e.target.value.split("-").map(Number);
                const picked = new Date(y, m - 1, d);
                const diffDays = Math.floor((picked.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                setWeekOffset(Math.floor(diffDays / 7));
              }
            }}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDates.map((d) => {
            const ds = formatDate(d);
            const active = ds === selectedDate;
            const isToday = ds === formatDate(new Date());
            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(ds)}
                className={`flex min-w-[72px] flex-col items-center rounded-xl px-3 py-2 text-sm transition-all
                  ${active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : isToday
                      ? "bg-surface border-2 border-primary/40 hover:border-primary/60"
                      : "bg-surface border border-border hover:border-primary/30"
                  }`}
              >
                <span className="text-xs font-medium">{DAY_SHORT[d.getDay()]}</span>
                <span className="text-lg font-bold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-border/20" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <p className="text-muted">No hay citas programadas para esta fecha.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <GlassCard key={appt.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light font-display text-sm font-bold text-primary">
                  {appt.pacienteNombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {appt.pacienteNombre}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {appt.servicioNombre}
                    {appt.pacienteTelefono && ` · ${appt.pacienteTelefono}`}
                  </p>
                  {appt.notasPaciente && (
                    <p className="mt-0.5 text-xs text-muted/70 italic">{appt.notasPaciente}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[appt.estado]}>
                  {statusLabel[appt.estado] || appt.estado}
                </Badge>

                {appt.estado === "pendiente" && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateStatus.mutate({ id: appt.id, action: "confirm" })}
                      className="rounded-lg p-2 text-primary transition-colors hover:bg-primary-light"
                      title="Confirmar"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ id: appt.id, action: "cancel" })}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Cancelar"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {appt.estado === "confirmada" && (
                  <button
                    onClick={() => updateStatus.mutate({ id: appt.id, action: "complete" })}
                    className="rounded-lg p-2 text-emerald-500 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    title="Marcar como atendida"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
