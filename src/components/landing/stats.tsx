"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { api } from "@/lib/api";

interface DoctorProfile {
  experienciaAnios: number;
}

export function Stats() {
  const { data: doctor } = useQuery({
    queryKey: ["doctor-profile-public"],
    queryFn: () => api.get<DoctorProfile>("/doctor-profile"),
  });

  const years = doctor?.experienciaAnios || 15;

  const stats = [
    { end: years, suffix: "+", label: "Años de experiencia" },
    { end: 5000, suffix: "+", label: "Pacientes atendidos" },
    { end: 98, suffix: "%", label: "Satisfacción" },
    { end: 12, suffix: "+", label: "Especialidades" },
  ];

  return (
    <section className="border-y border-border/40 bg-surface/50 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4">
        {stats.map((stat) => (
          <AnimatedCounter key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
