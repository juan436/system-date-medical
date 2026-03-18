"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { ReviewDialog } from "@/components/mi-cuenta/review-dialog";

const TOKEN_KEY = "system-date-token";

interface UserProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  servicioId: string;
  fechaCita: string;
  estado: string;
  notasPaciente?: string;
}

interface ServiceItem {
  id: string;
  nombre: string;
}

const statusLabel: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const statusVariant: Record<string, "default" | "success" | "warning" | "info"> = {
  pendiente: "warning",
  confirmada: "info",
  completada: "success",
  cancelada: "default",
};

type TabId = "citas" | "historial";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "citas",
    label: "Mis Citas",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: "historial",
    label: "Historial",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
];

export default function MiCuentaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [authState, setAuthState] = useState<"loading" | "unauthenticated" | "authenticated">("loading");
  const [activeTab, setActiveTab] = useState<TabId>("citas");

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setAuthState("unauthenticated");
      return;
    }
    api.get("/auth/profile", { token: stored })
      .then(() => {
        setToken(stored);
        setAuthState("authenticated");
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthState("unauthenticated");
      });
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => api.get<UserProfile>("/auth/profile", { token: token! }),
    enabled: !!token,
  });

  const { data: appointments = [], isLoading: loadingAppts } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => api.get<Appointment[]>("/appointments/my", { token: token! }),
    enabled: !!token,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services-list"],
    queryFn: () => api.get<ServiceItem[]>("/services"),
    enabled: !!token,
  });

  const getServiceName = (id: string) =>
    services.find((s) => s.id === id)?.nombre || "Servicio";

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    router.push("/");
  };

  const handleCancelAppointment = async (id: string) => {
    if (!token) return;
    try {
      await api.patch(`/appointments/${id}/cancel`, {}, { token });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    } catch {
      // silently fail
    }
  };

  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md px-4 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Inicia sesión para ver tu cuenta
          </h1>
          <p className="mt-3 text-muted">
            Necesitas estar autenticado para acceder a tu panel.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => router.push("/auth/login?redirect=/mi-cuenta")}>
              Iniciar sesión
            </Button>
            <Button variant="outline" onClick={() => router.push("/auth/registro?redirect=/mi-cuenta")}>
              Crear cuenta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date(new Date().toDateString());
  const upcoming = appointments
    .filter((a) => a.estado !== "cancelada" && a.estado !== "completada" && new Date(a.fechaCita) >= today)
    .sort((a, b) => new Date(a.fechaCita).getTime() - new Date(b.fechaCita).getTime());

  const past = appointments
    .filter((a) => a.estado === "completada" || a.estado === "cancelada" || new Date(a.fechaCita) < today)
    .sort((a, b) => new Date(b.fechaCita).getTime() - new Date(a.fechaCita).getTime());

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="font-display text-lg font-bold text-foreground">
            System<span className="text-primary">Date</span>
            <span className="ml-2 text-xs font-normal text-muted">Mi Cuenta</span>
          </span>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-muted transition-colors hover:text-foreground">
              Ver sitio
            </a>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400 transition-colors hover:text-red-500"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Hola, {profile?.nombre || "Paciente"}
            </h1>
            <p className="mt-1 text-sm text-muted">{profile?.email}</p>
          </div>
          <Link href="/agendar">
            <Button size="sm">Nueva cita</Button>
          </Link>
        </div>

          {/* Tabs */}
          <nav className="mb-6 flex gap-1 border-b border-border/40">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:border-border hover:text-foreground"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab: Mis Citas */}
          {activeTab === "citas" && (
            <>
              {loadingAppts ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-border/20" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <GlassCard className="py-10 text-center">
                  <svg className="mx-auto mb-3 h-10 w-10 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <p className="text-sm text-muted">No tienes citas próximas.</p>
                  <Link href="/agendar">
                    <Button size="sm" className="mt-4">Agendar una cita</Button>
                  </Link>
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((appt) => (
                    <GlassCard key={appt.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary-light font-display text-primary">
                          <span className="text-lg font-bold leading-tight">
                            {new Date(appt.fechaCita).getDate()}
                          </span>
                          <span className="text-[10px] font-medium uppercase">
                            {new Date(appt.fechaCita).toLocaleDateString("es-ES", { month: "short" })}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {getServiceName(appt.servicioId)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {new Date(appt.fechaCita).toLocaleDateString("es-ES", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
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
                        {(appt.estado === "pendiente" || appt.estado === "confirmada") && (
                          <button
                            onClick={() => handleCancelAppointment(appt.id)}
                            className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Cancelar cita"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab: Historial */}
          {activeTab === "historial" && (
            <>
              {loadingAppts ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-2xl bg-border/20" />
                  ))}
                </div>
              ) : past.length === 0 ? (
                <GlassCard className="py-10 text-center">
                  <p className="text-sm text-muted">Aún no tienes historial de citas.</p>
                </GlassCard>
              ) : (
                <GlassCard>
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
                        {past.map((appt) => (
                          <tr key={appt.id}>
                            <td className="py-2.5 pr-4 text-foreground">
                              {new Date(appt.fechaCita).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-2.5 pr-4 text-foreground">
                              {getServiceName(appt.servicioId)}
                            </td>
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
                </GlassCard>
              )}
            </>
          )}

      </main>

      {/* Review dialog - appears when patient has completed appointments and no review */}
      {token && <ReviewDialog token={token} />}
    </div>
  );
}
