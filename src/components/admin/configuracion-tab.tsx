"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DaySlotConfig {
  diaSemana: number;
  cuposMaximos: number;
  activo: boolean;
}

interface ScheduleConfig {
  diasConfig: DaySlotConfig[];
  fechasBloqueadas: string[];
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const DEFAULT_CONFIG: DaySlotConfig[] = Array.from({ length: 7 }, (_, i) => ({
  diaSemana: i,
  cuposMaximos: i >= 1 && i <= 3 ? 20 : i >= 4 && i <= 5 ? 10 : 0,
  activo: i >= 1 && i <= 5,
}));

export function ConfiguracionTab() {
  const token = typeof window !== "undefined" ? localStorage.getItem("system-date-token") : null;
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["schedule-config"],
    queryFn: () => api.get<ScheduleConfig>("/schedule-config", { token: token! }),
    enabled: !!token,
  });

  const [dias, setDias] = useState<DaySlotConfig[]>(config?.diasConfig || DEFAULT_CONFIG);
  const [blockDate, setBlockDate] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Sync state when data loads
  if (config && !initialized) {
    setDias(config.diasConfig.length > 0 ? config.diasConfig : DEFAULT_CONFIG);
    setInitialized(true);
  }

  const saveConfig = useMutation({
    mutationFn: () =>
      api.put("/schedule-config", { diasConfig: dias }, { token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-config"] });
    },
  });

  const addBlockedDate = useMutation({
    mutationFn: (fecha: string) =>
      api.post("/schedule-config/block-date", { fecha }, { token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-config"] });
      setBlockDate("");
    },
  });

  const removeBlockedDate = useMutation({
    mutationFn: (fecha: string) =>
      api.post("/schedule-config/unblock-date", { fecha }, { token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-config"] });
    },
  });

  const updateDay = (index: number, field: keyof DaySlotConfig, value: unknown) => {
    setDias((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-border/20" />)}</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Configuración de Horarios</h1>
        <p className="mt-1 text-sm text-muted">Ajusta los cupos diarios y bloquea fechas</p>
      </div>

      {/* Day configuration */}
      <GlassCard className="mb-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Cupos por día</h2>
        <div className="space-y-3">
          {dias.map((day, i) => (
            <div
              key={day.diaSemana}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                day.activo ? "bg-surface" : "bg-border/10 opacity-60"
              }`}
            >
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={day.activo}
                  onChange={(e) => updateDay(i, "activo", e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="w-24 text-sm font-medium text-foreground">{DAY_NAMES[day.diaSemana]}</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={day.cuposMaximos}
                  onChange={(e) => updateDay(i, "cuposMaximos", Number(e.target.value))}
                  disabled={!day.activo}
                  className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
                  placeholder="Cupos"
                  min={0}
                />
                <span className="text-xs text-muted">cupos</span>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="mt-4"
          onClick={() => saveConfig.mutate()}
          loading={saveConfig.isPending}
        >
          Guardar configuración
        </Button>
        {saveConfig.isSuccess && (
          <span className="ml-3 text-sm text-emerald-600">Guardado correctamente</span>
        )}
      </GlassCard>

      {/* Blocked dates */}
      <GlassCard>
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Fechas bloqueadas</h2>

        <div className="mb-4 flex items-center gap-3">
          <input
            type="date"
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
            className="w-48 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button
            size="sm"
            onClick={() => blockDate && addBlockedDate.mutate(blockDate)}
            loading={addBlockedDate.isPending}
            disabled={!blockDate}
          >
            Bloquear fecha
          </Button>
        </div>

        {config?.fechasBloqueadas && config.fechasBloqueadas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {config.fechasBloqueadas.map((fecha) => {
              const dateStr = new Date(fecha).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <Badge key={fecha} variant="warning" className="gap-1.5">
                  {dateStr}
                  <button
                    onClick={() => removeBlockedDate.mutate(fecha)}
                    className="ml-1 hover:text-red-600"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">No hay fechas bloqueadas.</p>
        )}
      </GlassCard>
    </div>
  );
}
