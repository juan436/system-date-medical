"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface ServiceItem {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
}

interface ServiceSelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function ServiceSelector({ selected, onSelect }: ServiceSelectorProps) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ServiceItem[]>("/services")
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-border/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelect(service.id)}
          className="text-left"
        >
          <GlassCard
            className={`cursor-pointer transition-all duration-200 ${
              selected === service.id
                ? "border-primary bg-primary-light/30 ring-2 ring-primary/20"
                : "hover:border-primary/30"
            }`}
          >
            <h3 className="font-display font-semibold text-foreground">
              {service.nombre}
            </h3>
            <p className="mt-1 text-sm text-muted">{service.descripcion}</p>
            <Badge className="mt-3">{service.duracionMinutos} min</Badge>
          </GlassCard>
        </button>
      ))}
    </div>
  );
}
