"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/lib/user-context";

const isHomeActive = (p: string) => p === "/";
const isGamesActive = (p: string) => p.startsWith("/games");
const isHallActive = (p: string) => p.startsWith("/hall-of-fame");
const isAboutActive = (p: string) => p.startsWith("/about");
const isAuthActive = (p: string) => p.startsWith("/auth");

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useUser();

  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo">
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={isHomeActive(pathname) ? "active" : ""}>
            Inicio
          </Link>
          <Link href="/games" className={isGamesActive(pathname) ? "active" : ""}>
            Biblioteca
          </Link>
          <Link href="/hall-of-fame" className={isHallActive(pathname) ? "active" : ""}>
            Salón de la Fama
          </Link>
          <Link href="/about" className={isAboutActive(pathname) ? "active" : ""}>
            Acerca de
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={signOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link href="/auth" className="btn auth-btn">
            Iniciar Sesión
          </Link>
        )}
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú">
          ≡
        </button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close}></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link href="/" className={isHomeActive(pathname) ? "active" : ""} onClick={close}>
          Inicio
        </Link>
        <Link href="/games" className={isGamesActive(pathname) ? "active" : ""} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/hall-of-fame" className={isHallActive(pathname) ? "active" : ""} onClick={close}>
          Salón de la Fama
        </Link>
        <Link href="/about" className={isAboutActive(pathname) ? "active" : ""} onClick={close}>
          Acerca de
        </Link>
        <Link href="/auth" className={isAuthActive(pathname) ? "active" : ""} onClick={close}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }}></div>
        <div className="pixel" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
