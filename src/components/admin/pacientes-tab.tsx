"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/csv-export";

interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  whatsapp?: string;
  estado: string;
  createdAt: string;
}

interface PaginatedPatients {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
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
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const statusVariant: Record<string, "default" | "success" | "warning" | "info"> = {
  confirmada: "info",
  completada: "success",
  cancelada: "default",
};

const PAGE_SIZE = 10;

export function PacientesTab() {
  const token = typeof window !== "undefined" ? localStorage.getItem("system-date-token") : null;
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", cedula: "", telefono: "" });

  const { data: paginatedResult, isLoading } = useQuery({
    queryKey: ["admin-patients", searchQuery, page],
    queryFn: () =>
      api.get<PaginatedPatients>(
        `/admin/patients?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${PAGE_SIZE}`,
        { token: token! },
      ),
    enabled: !!token,
  });

  const patients = paginatedResult?.data ?? [];
  const total = paginatedResult?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const { data: history = [] } = useQuery({
    queryKey: ["patient-history", selectedPatient],
    queryFn: () =>
      api.get<PatientAppointment[]>(`/admin/patients/${selectedPatient}/appointments`, { token: token! }),
    enabled: !!token && !!selectedPatient,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { nombre: string; apellido: string; cedula: string; telefono: string }) =>
      api.patch(`/admin/patients/${selectedPatient}`, data, { token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      setEditing(false);
    },
  });

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

  const startEdit = () => {
    if (!selectedPatientData) return;
    setEditForm({
      nombre: selectedPatientData.nombre,
      apellido: selectedPatientData.apellido,
      cedula: selectedPatientData.cedula,
      telefono: selectedPatientData.telefono,
    });
    setEditing(true);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
    setSelectedPatient(null);
  };

  const handleExportPatients = () => {
    exportToCsv("pacientes.csv", patients.map((p) => ({
      Nombre: p.nombre,
      Apellido: p.apellido,
      Cédula: p.cedula,
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
            {total} pacientes registrados
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportPatients}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar CSV
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
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
              <p className="text-sm text-muted">
                {searchQuery ? "No se encontraron pacientes." : "Aún no hay pacientes registrados."}
              </p>
            </GlassCard>
          ) : (
            <>
              <div className="space-y-2">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => { setSelectedPatient(patient.id); setEditing(false); }}
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
                          <p className="truncate text-xs text-muted">
                            C.I {patient.cedula} · {patient.telefono}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </button>
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

        {/* Patient detail / history */}
        <div className="lg:col-span-3">
          {selectedPatientData ? (
            <GlassCard>
              <div className="mb-6 flex items-start justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light font-display text-lg font-bold text-primary">
                    {selectedPatientData.nombre[0]}{selectedPatientData.apellido[0]}
                  </div>
                  {editing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={editForm.nombre}
                          onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                          placeholder="Nombre"
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                        <input
                          value={editForm.apellido}
                          onChange={(e) => setEditForm((f) => ({ ...f, apellido: e.target.value }))}
                          placeholder="Apellido"
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={editForm.cedula}
                          onChange={(e) => setEditForm((f) => ({ ...f, cedula: e.target.value }))}
                          placeholder="Cédula"
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                        <input
                          value={editForm.telefono}
                          onChange={(e) => setEditForm((f) => ({ ...f, telefono: e.target.value }))}
                          placeholder="Teléfono"
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateMutation.mutate(editForm)}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground">
                        {selectedPatientData.nombre} {selectedPatientData.apellido}
                      </h2>
                      <p className="text-sm text-muted">C.I. {selectedPatientData.cedula}</p>
                      <p className="text-sm text-muted">{selectedPatientData.email}</p>
                      <p className="text-sm text-muted">{selectedPatientData.telefono}</p>
                    </div>
                  )}
                </div>
                {!editing && (
                  <button
                    onClick={startEdit}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
                    title="Editar paciente"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                )}
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
