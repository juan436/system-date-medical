import { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
}

export function Section({ title, subtitle, className = "", children, ...props }: SectionProps) {
  return (
    <section className={`py-16 md:py-24 ${className}`} {...props}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-muted text-lg">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
