"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const TOKEN_KEY = "system-date-token";

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#sobre-mi", label: "Sobre Mí" },
  { href: "#resenas", label: "Reseñas" },
];

interface UserSession {
  id: string;
  nombre?: string;
  email: string;
  rol: string;
}

interface DoctorProfile {
  nombreCompleto: string;
}

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [checked, setChecked] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: doctor } = useQuery({
    queryKey: ["doctor-profile-public"],
    queryFn: () => api.get<DoctorProfile>("/doctor-profile"),
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setChecked(true);
      return;
    }
    api.get<UserSession>("/auth/profile", { token })
      .then((user) => setSession(user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setSession(null);
    router.push("/");
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const panelHref = session?.rol === "admin" ? "/admin" : "/mi-cuenta";

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [dropdownOpen]);

  // Extract short name for branding (e.g., "Dra. García")
  const brandName = doctor?.nombreCompleto
    ? (() => {
        const parts = doctor.nombreCompleto.split(" ");
        if (parts[0]?.match(/^(Dra?\.|Dr\.)/i)) {
          return `${parts[0]} ${parts[parts.length - 1]}`;
        }
        return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0];
      })()
    : null;

  const initials = session?.nombre
    ? session.nombre.charAt(0).toUpperCase()
    : "U";

  const authSection = !checked ? null : session ? (
    <>
      <Link href="/agendar">
        <Button size="sm">Agendar Cita</Button>
      </Link>
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setDropdownOpen((o) => !o); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white transition-shadow hover:ring-2 hover:ring-primary/30"
          title={session.nombre || session.email}
        >
          {initials}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border/50 bg-background py-1 shadow-lg">
            <div className="border-b border-border/30 px-4 py-2.5">
              <p className="truncate text-sm font-medium text-foreground">{session.nombre}</p>
              <p className="truncate text-xs text-muted">{session.email}</p>
            </div>
            <Link
              href={panelHref}
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
            >
              <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Mi Panel
            </Link>
            <button
              onClick={() => { handleLogout(); setDropdownOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </>
  ) : (
    <>
      <Link href="/auth/login">
        <Button variant="ghost" size="sm">Iniciar Sesión</Button>
      </Link>
      <Link href="/agendar">
        <Button size="sm">Agendar Cita</Button>
      </Link>
    </>
  );

  const mobileAuthSection = !checked ? null : session ? (
    <>
      <Link href={panelHref} onClick={() => setMobileOpen(false)}>
        <Button variant="outline" size="sm" className="w-full">Mi Panel</Button>
      </Link>
      <Link href="/agendar" onClick={() => setMobileOpen(false)}>
        <Button size="sm" className="w-full">Agendar Cita</Button>
      </Link>
      <button
        onClick={() => { handleLogout(); setMobileOpen(false); }}
        className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        Cerrar sesión
      </button>
    </>
  ) : (
    <>
      <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
        <Button variant="outline" size="sm" className="w-full">Iniciar Sesión</Button>
      </Link>
      <Link href="/agendar" onClick={() => setMobileOpen(false)}>
        <Button size="sm" className="w-full">Agendar Cita</Button>
      </Link>
    </>
  );

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/40 bg-background/90 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* Medical cross icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            {brandName || (<>System<span className="text-primary">Date</span></>)}
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-muted transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3">
            {authSection}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-primary-light md:hidden"
          aria-label="Abrir menú"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-primary-light hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-border/30">
              {mobileAuthSection}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
