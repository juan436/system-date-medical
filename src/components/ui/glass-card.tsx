import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function GlassCard({ hover = false, className = "", children, ...props }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-md p-6
        shadow-[0_4px_24px_rgba(0,0,0,0.04)]
        ${hover ? "transition-all duration-300 hover:shadow-[0_8px_40px_rgba(77,168,160,0.1)] hover:-translate-y-1 hover:border-primary/20" : ""}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
