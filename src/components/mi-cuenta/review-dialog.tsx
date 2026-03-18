"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hovered || value);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <svg
              className={`h-8 w-8 ${filled ? "text-amber-400" : "text-border"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export function ReviewDialog({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const { data } = useQuery({
    queryKey: ["should-review"],
    queryFn: () => api.get<{ shouldReview: boolean }>("/reviews/should-review", { token }),
    enabled: !!token,
  });

  useEffect(() => {
    if (data?.shouldReview && !dismissed) {
      setOpen(true);
    }
  }, [data, dismissed]);

  const mutation = useMutation({
    mutationFn: (body: { calificacion: number; comentario: string }) =>
      api.post("/reviews", body, { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["should-review"] });
      setSuccessMsg(true);
      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(false);
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ calificacion, comentario });
  };

  const handleDismiss = () => {
    setOpen(false);
    setDismissed(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-border/50 bg-background p-6 shadow-2xl">
        {successMsg ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <svg className="h-8 w-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              ¡Gracias por tu reseña!
            </h3>
            <p className="mt-2 text-sm text-muted">Tu opinión es muy valiosa para nosotros.</p>
          </div>
        ) : (
          <>
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted transition-colors hover:text-foreground"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
                <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 16.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                ¿Cómo fue tu experiencia?
              </h3>
              <p className="mt-1 text-sm text-muted">
                Tu cita fue completada. Cuéntanos cómo te fue con la doctora.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex justify-center">
                <StarSelector value={calificacion} onChange={setCalificacion} />
              </div>

              <div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comparte tu experiencia..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {mutation.isError && (
                <p className="text-center text-sm text-red-500">
                  {(mutation.error as Error).message}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mutation.isPending || !comentario.trim()}
                >
                  {mutation.isPending ? "Enviando..." : "Enviar reseña"}
                </Button>
                <Button type="button" variant="outline" onClick={handleDismiss}>
                  Ahora no
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
