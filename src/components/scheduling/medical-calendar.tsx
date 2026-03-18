"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface Availability {
  fecha: string;
  cuposDisponibles: number;
  cuposMaximos: number;
  disponible: boolean;
}

interface MedicalCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function MedicalCalendar({ selectedDate, onSelectDate }: MedicalCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [availability, setAvailability] = useState<Record<string, Availability>>({});

  const fetchMonthAvailability = useCallback(async () => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const promises: Promise<void>[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) continue;

      const dateStr = date.toISOString().split("T")[0];
      promises.push(
        api
          .get<Availability>(`/availability?date=${dateStr}`)
          .then((data) => {
            setAvailability((prev) => ({ ...prev, [dateStr]: data }));
          })
          .catch(() => {}),
      );
    }

    await Promise.all(promises);
  }, [viewMonth, viewYear, today]);

  useEffect(() => {
    fetchMonthAvailability();
  }, [fetchMonthAvailability]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isPast = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const getDateStr = (day: number) =>
    new Date(viewYear, viewMonth, day).toISOString().split("T")[0];

  const isSelected = (day: number) =>
    selectedDate?.toISOString().split("T")[0] === getDateStr(day);

  const getAvailabilityColor = (day: number): string => {
    if (isPast(day)) return "";
    const av = availability[getDateStr(day)];
    if (!av || !av.disponible) return "bg-red-50 text-red-300 dark:bg-red-900/10 dark:text-red-800";
    const ratio = av.cuposDisponibles / av.cuposMaximos;
    if (ratio > 0.5) return "bg-emerald-50 text-foreground hover:bg-emerald-100 dark:bg-emerald-900/20";
    if (ratio > 0.2) return "bg-amber-50 text-foreground hover:bg-amber-100 dark:bg-amber-900/20";
    return "bg-orange-50 text-foreground hover:bg-orange-100 dark:bg-orange-900/20";
  };

  const canGoBack =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          disabled={!canGoBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-light disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-display text-lg font-semibold text-foreground">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-light"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_NAMES.map((name) => (
          <div key={name} className="py-2 text-center text-xs font-medium text-muted">
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const past = isPast(day);
          const av = availability[getDateStr(day)];
          const blocked = av && !av.disponible;

          return (
            <button
              key={day}
              disabled={past || !!blocked}
              onClick={() => onSelectDate(new Date(viewYear, viewMonth, day))}
              className={`relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium
                transition-all duration-200
                ${past ? "cursor-not-allowed text-muted/40" : ""}
                ${blocked && !past ? "cursor-not-allowed" : ""}
                ${!past && !blocked ? "cursor-pointer" : ""}
                ${isSelected(day) ? "bg-primary text-white shadow-md shadow-primary/30" : getAvailabilityColor(day)}
              `}
            >
              {day}
              {!past && av && av.disponible && !isSelected(day) && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-200" /> Alta disponibilidad
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-200" /> Media
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-200" /> Baja
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-200" /> No disponible
        </span>
      </div>
    </div>
  );
}
