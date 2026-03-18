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

interface PaginatedAppointments {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
}

interface Availability {
  cuposMaximos: number;
  cuposOcupados: number;
  cuposDisponibles: number;
  disponible: boolean;
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

type StatusFilter = "todas" | "confirmada" | "cancelada" | "completada";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "confirmada", label: "Confirmadas" },
  { key: "completada", label: "Completadas" },
  { key: "cancelada", label: "Canceladas" },
];

const PAGE_SIZE = 10;

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AgendaTab() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [weekOffset, setWeekOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [page, setPage] = useState(1);
  const token = typeof window !== "undefined" ? localStorage.getItem("system-date-token") : null;
  const queryClient = useQueryClient();

  const statusParam = statusFilter === "todas" ? "" : `&status=${statusFilter}`;

  const { data: paginatedResult, isLoading } = useQuery({
    queryKey: ["admin-appointments", selectedDate, statusFilter, page],
    queryFn: () =>
      api.get<PaginatedAppointments>(
        `/admin/appointments?date=${selectedDate}&page=${page}&limit=${PAGE_SIZE}${statusParam}`,
        { token: token! },
      ),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const appointments = paginatedResult?.data ?? [];
  const total = paginatedResult?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Separate query for counts (all statuses, no pagination)
  const { data: allResult } = useQuery({
    queryKey: ["admin-appointments-counts", selectedDate],
    queryFn: () =>
      api.get<PaginatedAppointments>(
        `/admin/appointments?date=${selectedDate}&page=1&limit=1`,
        { token: token! },
      ),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const { data: confirmadasResult } = useQuery({
    queryKey: ["admin-appointments-counts", selectedDate, "confirmada"],
    queryFn: () =>
      api.get<PaginatedAppointments>(
        `/admin/appointments?date=${selectedDate}&page=1&limit=1&status=confirmada`,
        { token: token! },
      ),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const { data: completadasResult } = useQuery({
    queryKey: ["admin-appointments-counts", selectedDate, "completada"],
    queryFn: () =>
      api.get<PaginatedAppointments>(
        `/admin/appointments?date=${selectedDate}&page=1&limit=1&status=completada`,
        { token: token! },
      ),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const { data: canceladasResult } = useQuery({
    queryKey: ["admin-appointments-counts", selectedDate, "cancelada"],
    queryFn: () =>
      api.get<PaginatedAppointments>(
        `/admin/appointments?date=${selectedDate}&page=1&limit=1&status=cancelada`,
        { token: token! },
      ),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const totalAll = allResult?.total ?? 0;
  const confirmadasCount = confirmadasResult?.total ?? 0;
  const completadasCount = completadasResult?.total ?? 0;
  const canceladasCount = canceladasResult?.total ?? 0;

  const { data: availability } = useQuery({
    queryKey: ["availability", selectedDate],
    queryFn: () => api.get<Availability>(`/availability?date=${selectedDate}`),
    enabled: !!selectedDate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch<Appointment>(`/admin/appointments/${id}/${action}`, {}, { token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-appointments-counts"] });
      queryClient.invalidateQueries({ queryKey: ["availability", selectedDate] });
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

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7 + i);
    return d;
  });

  const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const weekRangeLabel = `${weekDates[0].getDate()} ${MONTH_SHORT[weekDates[0].getMonth()]} - ${weekDates[6].getDate()} ${MONTH_SHORT[weekDates[6].getMonth()]}`;

  const goToPrevWeek = () => setWeekOffset((o) => o - 1);
  const goToNextWeek = () => setWeekOffset((o) => o + 1);
  const goToToday = () => {
    setWeekOffset(0);
    setSelectedDate(formatDate(new Date()));
  };

  const handleFilterChange = (key: StatusFilter) => {
    setStatusFilter(key);
    setPage(1);
  };

  const MONTH_LONG = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DAY_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const [selY, selM, selD] = selectedDate.split("-").map(Number);
  const selDateObj = new Date(selY, selM - 1, selD);
  const selectedDateLabel = `${DAY_LONG[selDateObj.getDay()]} ${selD} de ${MONTH_LONG[selDateObj.getMonth()]}`;

  const countForFilter = (key: StatusFilter) =>
    key === "todas" ? totalAll
    : key === "confirmada" ? confirmadasCount
    : key === "completada" ? completadasCount
    : canceladasCount;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Agenda</h1>
          <p className="mt-1 text-sm text-muted">
            {totalAll} citas para este día
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
                setPage(1);
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
                onClick={() => { setSelectedDate(ds); setPage(1); }}
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

      {/* Day detail: date label + availability */}
      <GlassCard className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold capitalize text-foreground">{selectedDateLabel}</p>
            {availability ? (
              <p className="mt-1 text-sm text-muted">
                {availability.cuposMaximos > 0 ? (
                  <>
                    <span className={`font-semibold ${availability.cuposDisponibles === 0 ? "text-red-500" : availability.cuposDisponibles <= 3 ? "text-amber-500" : "text-emerald-500"}`}>
                      {availability.cuposDisponibles}
                    </span>
                    {" "}cupos disponibles de {availability.cuposMaximos}
                  </>
                ) : (
                  "No hay cupos configurados para este día"
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Cargando disponibilidad...</p>
            )}
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-blue-500">{confirmadasCount}</p>
              <p className="text-[10px] text-muted">Confirmadas</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-500">{completadasCount}</p>
              <p className="text-[10px] text-muted">Completadas</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-400">{canceladasCount}</p>
              <p className="text-[10px] text-muted">Canceladas</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Status filter tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-surface p-1 border border-border">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              statusFilter === f.key
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {f.label}
            <span className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
              statusFilter === f.key
                ? "bg-white/20 text-white"
                : "bg-border/40 text-muted"
            }`}>
              {countForFilter(f.key)}
            </span>
          </button>
        ))}
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
          <p className="text-muted">
            {statusFilter === "todas"
              ? "No hay citas programadas para esta fecha."
              : `No hay citas ${FILTERS.find((f) => f.key === statusFilter)?.label.toLowerCase()} para esta fecha.`}
          </p>
        </GlassCard>
      ) : (
        <>
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

                  {appt.estado === "confirmada" && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, action: "complete" })}
                        className="rounded-lg p-2 text-emerald-500 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        title="Marcar como atendida"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, action: "cancel" })}
                        className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Cancelar cita"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border bg-surface p-2 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="text-sm text-muted">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border bg-surface p-2 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
