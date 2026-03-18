"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Review {
  id: string;
  pacienteNombre: string;
  comentario: string;
  calificacion: number;
}

const fallbackReviews: Review[] = [
  {
    id: "1",
    pacienteNombre: "Ana M.",
    comentario: "Excelente atención. La doctora se tomó el tiempo de explicar todo con detalle y me hizo sentir realmente escuchada. La mejor experiencia médica que he tenido.",
    calificacion: 5,
  },
  {
    id: "2",
    pacienteNombre: "Carlos R.",
    comentario: "El proceso de agendar fue muy sencillo y la consulta superó mis expectativas. Trato humano y profesional en todo momento.",
    calificacion: 5,
  },
  {
    id: "3",
    pacienteNombre: "Luisa P.",
    comentario: "Me sentí escuchada y bien atendida. El seguimiento ha sido impecable y se nota la dedicación en cada consulta.",
    calificacion: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < count ? "text-amber-400" : "text-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
        </svg>
      ))}
    </div>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);

  useEffect(() => {
    api
      .get<Review[]>("/reviews")
      .then((data) => {
        if (data.length > 0) setReviews(data);
      })
      .catch(() => {
        // Keep fallback reviews
      });
  }, []);

  return (
    <section id="resenas" className="relative py-20 md:py-32">
      {/* Decorative */}
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <Badge variant="info" className="mb-4">Testimonios</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Pacientes que confían en{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              su doctora
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            La satisfacción de mis pacientes es el reflejo de mi compromiso con la excelencia médica.
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="relative overflow-hidden rounded-2xl border border-border/40 bg-surface/80 p-6 backdrop-blur-sm"
            >
              {/* Quote mark */}
              <div className="absolute -right-2 -top-2 font-display text-7xl font-bold text-primary/5">
                &ldquo;
              </div>

              <Stars count={review.calificacion} />

              <p className="relative mt-4 text-sm leading-relaxed text-muted">
                &ldquo;{review.comentario}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-border/30 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 font-display text-sm font-bold text-primary">
                  {review.pacienteNombre[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.pacienteNombre}</p>
                  <p className="flex items-center gap-1 text-xs text-primary/80">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    Paciente verificado
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
