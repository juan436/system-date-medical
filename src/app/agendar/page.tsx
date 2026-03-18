"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ProgressSteps } from "@/components/scheduling/progress-steps";
import { ServiceSelector } from "@/components/scheduling/service-selector";
import { MedicalCalendar } from "@/components/scheduling/medical-calendar";
import { BookingConfirmation } from "@/components/scheduling/booking-confirmation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const TOKEN_KEY = "system-date-token";
const STEPS = ["Servicio", "Fecha", "Confirmar"];

interface ServiceData {
  id: string;
  nombre: string;
  duracionMinutos: number;
}

export default function AgendarPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "unauthenticated" | "authenticated">("loading");
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);

  // Auth gate: check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAuthState("unauthenticated");
      return;
    }

    api.get("/auth/profile", { token })
      .then(() => setAuthState("authenticated"))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthState("unauthenticated");
      });
  }, []);

  useEffect(() => {
    if (authState === "authenticated") {
      api.get<ServiceData[]>("/services").then(setServices).catch(() => {});
    }
  }, [authState]);

  const currentService = services.find((s) => s.id === selectedService);

  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedService;
      case 1: return !!selectedDate;
      case 2: return true;
      default: return false;
    }
  };

  const handleBook = async () => {
    if (!selectedService || !selectedDate) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/auth/login?redirect=/agendar");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post(
        "/appointments",
        {
          servicioId: selectedService,
          fechaCita: selectedDate.toISOString().split("T")[0],
          notasPaciente: notes || undefined,
        },
        { token },
      );
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (authState === "loading") {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-background pt-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
      </>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-background pt-20">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
              <svg className="h-10 w-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Necesitas una cuenta para agendar
            </h1>
            <p className="mt-3 text-muted">
              Para poder agendar una cita necesitamos saber quién eres. Inicia sesión o crea una cuenta si aún no tienes una.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => router.push("/auth/login?redirect=/agendar")}>
                Iniciar sesión
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth/registro?redirect=/agendar")}>
                Crear cuenta
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-background pt-20">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
              <svg className="h-10 w-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Cita agendada
            </h1>
            <p className="mt-3 text-muted">
              Tu cita ha sido registrada exitosamente. Te contactaremos para confirmarla.
            </p>
            <Button className="mt-8" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Agenda tu cita
            </h1>
            <p className="mt-2 text-muted">
              Sigue los pasos para reservar tu consulta
            </p>
          </div>

          <ProgressSteps currentStep={step} steps={STEPS} />

          {/* Step content */}
          <div className="min-h-[300px]">
            {step === 0 && (
              <ServiceSelector
                selected={selectedService}
                onSelect={(id) => setSelectedService(id)}
              />
            )}

            {step === 1 && (
              <div className="space-y-6">
                <MedicalCalendar
                  selectedDate={selectedDate}
                  onSelectDate={(date) => setSelectedDate(date)}
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Notas para la doctora (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe brevemente el motivo de tu consulta..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            )}

            {step === 2 && selectedDate && (
              <BookingConfirmation
                serviceName={currentService?.nombre || ""}
                date={selectedDate}
                notes={notes}
              />
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Atrás
            </Button>

            {step < 2 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Siguiente
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : (
              <Button onClick={handleBook} loading={loading}>
                Confirmar cita
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
