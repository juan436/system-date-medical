"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  precioReferencial: number;
  estado: string;
}

const emptyForm = {
  nombre: "",
  descripcion: "",
  duracionMinutos: 30,
  precioReferencial: 0,
};

export function ServiciosTab() {
  const token = typeof window !== "undefined" ? localStorage.getItem("system-date-token") : null;
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => api.get<Service[]>("/services/admin/all", { token: token! }),
    enabled: !!token,
  });

  const createService = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      api.post("/services", data, { token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      resetForm();
    },
  });

  const updateService = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof emptyForm }) =>
      api.put(`/services/${id}`, data, { token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      resetForm();
    },
  });

  const toggleStatus = useMutation({
    mutationFn: (id: string) =>
      api.put(`/services/${id}/toggle`, {}, { token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (service: Service) => {
    setForm({
      nombre: service.nombre,
      descripcion: service.descripcion,
      duracionMinutos: service.duracionMinutos,
      precioReferencial: service.precioReferencial,
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.nombre.trim() || !form.descripcion.trim()) return;

    if (editingId) {
      updateService.mutate({ id: editingId, data: form });
    } else {
      createService.mutate(form);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(price);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Servicios</h1>
          <p className="mt-1 text-sm text-muted">{services.length} servicios configurados</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Cancelar" : "Nuevo servicio"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <GlassCard className="mb-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
            {editingId ? "Editar servicio" : "Crear servicio"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="nombre"
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Consulta General"
            />
            <Input
              id="descripcion"
              label="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Evaluación médica integral..."
            />
            <Input
              id="duracion"
              label="Duración (minutos)"
              type="number"
              value={form.duracionMinutos}
              onChange={(e) => setForm({ ...form, duracionMinutos: Number(e.target.value) })}
              min={5}
            />
            <Input
              id="precio"
              label="Precio referencial (COP)"
              type="number"
              value={form.precioReferencial}
              onChange={(e) => setForm({ ...form, precioReferencial: Number(e.target.value) })}
              min={0}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleSubmit}
              loading={createService.isPending || updateService.isPending}
              disabled={!form.nombre.trim() || !form.descripcion.trim()}
            >
              {editingId ? "Actualizar" : "Crear servicio"}
            </Button>
            <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
          </div>
        </GlassCard>
      )}

      {/* Services list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-border/20" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <p className="text-muted">No hay servicios configurados.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <GlassCard key={service.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-semibold text-foreground">{service.nombre}</h3>
                  <Badge variant={service.estado === "activo" ? "success" : "default"}>
                    {service.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{service.descripcion}</p>
                <div className="mt-2 flex gap-4 text-xs text-muted">
                  <span>{service.duracionMinutos} min</span>
                  <span>{formatPrice(service.precioReferencial)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-primary-light hover:text-primary"
                  title="Editar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button
                  onClick={() => toggleStatus.mutate(service.id)}
                  className={`rounded-lg p-2 transition-colors ${
                    service.estado === "activo"
                      ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  }`}
                  title={service.estado === "activo" ? "Desactivar" : "Activar"}
                >
                  {service.estado === "activo" ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
