"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/csv-export";

interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  whatsapp?: string;
  estado: string;
  createdAt: string;
}

interface PatientAppointment {
  id: string;
  fechaCita: string;
  estado: string;
  servicioId: string;
  servicioNombre: string;
  notasPaciente?: string;
}

const statusLabel: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  reprogramada: "Reprogramada",
};

const statusVariant: Record<string, "default" | "success" | "warning" | "info"> = {
  pendiente: "warning",
  confirmada: "info",
  completada: "success",
  cancelada: "default",
};

export function PacientesTab() {
  const token = typeof window !== "undefined" ? localStorage.getItem("system-date-token") : null;
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["admin-patients"],
    queryFn: () => api.get<Patient[]>("/admin/patients", { token: token! }),
    enabled: !!token,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["patient-history", selectedPatient],
    queryFn: () =>
      api.get<PatientAppointment[]>(`/admin/patients/${selectedPatient}/appointments`, { token: token! }),
    enabled: !!token && !!selectedPatient,
  });

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

  const handleExportPatients = () => {
    exportToCsv("pacientes.csv", patients.map((p) => ({
      Nombre: p.nombre,
      Apellido: p.apellido,
      Email: p.email,
      Teléfono: p.telefono,
      WhatsApp: p.whatsapp || "",
      "Fecha Registro": new Date(p.createdAt).toLocaleDateString("es-ES"),
    })));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="mt-1 text-sm text-muted">
            {patients.length} pacientes registrados
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportPatients}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Patient list */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-border/20" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <GlassCard className="py-12 text-center">
              <p className="text-sm text-muted">Aún no hay pacientes registrados.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className="w-full text-left"
                >
                  <GlassCard
                    className={`cursor-pointer py-4 ${
                      selectedPatient === patient.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light font-display text-sm font-semibold text-primary">
                        {patient.nombre[0]}{patient.apellido[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {patient.nombre} {patient.apellido}
                        </p>
                        <p className="truncate text-xs text-muted">{patient.email}</p>
                      </div>
                    </div>
                  </GlassCard>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Patient detail / history */}
        <div className="lg:col-span-3">
          {selectedPatientData ? (
            <GlassCard>
              <div className="mb-6 flex items-center gap-4 border-b border-border/40 pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light font-display text-lg font-bold text-primary">
                  {selectedPatientData.nombre[0]}{selectedPatientData.apellido[0]}
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {selectedPatientData.nombre} {selectedPatientData.apellido}
                  </h2>
                  <p className="text-sm text-muted">{selectedPatientData.email}</p>
                  <p className="text-sm text-muted">{selectedPatientData.telefono}</p>
                </div>
              </div>

              <h3 className="mb-3 text-sm font-semibold text-foreground">Historial de citas</h3>

              {history.length === 0 ? (
                <p className="text-sm text-muted">Sin citas registradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 text-left text-xs text-muted">
                        <th className="pb-2 pr-4">Fecha</th>
                        <th className="pb-2 pr-4">Servicio</th>
                        <th className="pb-2 pr-4">Estado</th>
                        <th className="pb-2">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {history.map((appt) => (
                        <tr key={appt.id}>
                          <td className="py-2.5 pr-4 text-foreground">
                            {new Date(appt.fechaCita).toLocaleDateString("es-ES")}
                          </td>
                          <td className="py-2.5 pr-4 text-foreground">{appt.servicioNombre}</td>
                          <td className="py-2.5 pr-4">
                            <Badge variant={statusVariant[appt.estado]}>
                              {statusLabel[appt.estado] || appt.estado}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-muted">{appt.notasPaciente || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="py-16 text-center">
              <svg className="mx-auto mb-3 h-10 w-10 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <p className="text-sm text-muted">Selecciona un paciente para ver su historial</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
