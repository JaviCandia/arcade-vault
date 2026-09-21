# SPEC 01 — MVP visual de Arcade Vault (pantallas sin juegos)

> **Nota (2026-09-21):** el esquema de rutas de este spec fue reemplazado: `/` ahora es el Home, `/about` es nuevo, y las rutas pasaron a inglés (`/games`, `/games/[id]`, `/games/[id]/play`, `/hall-of-fame`). Lo descrito abajo es el registro histórico.

> **Status:** Implemented \
> **Depends on:** — \
> **Date:** 2026-09-17 \
> **Objective:** Implementar en Next.js App Router, solo la parte visual, las cinco pantallas del prototipo de referencia (`references/templates/`) — biblioteca, detalle de juego, reproductor, salón de la fama y autenticación — sin implementar ningún juego real.

---

## Scope

**In:**

- Ruteo real de App Router: `/` (biblioteca), `/juegos/[id]` (detalle), `/juegos/[id]/jugar` (reproductor), `/salon` (salón de la fama), `/auth` (login/registro).
- Barra de navegación (`Nav`) sticky con estado activo por ruta, contador de créditos estático (`CRÉDITOS · 03`), y panel/menú móvil con backdrop, replicando `nav.jsx`.
- Biblioteca: hero con título animado, buscador por nombre, chips de categoría (`CATS`), grilla de `GameCard` con tilt al hover, estado "sin resultados".
- Detalle: portada, tags, descripción, franja de estadísticas (partidas, mejor global, dificultad fija de 3/5 estrellas), botones "Jugar ahora" / "Volver al vault", tabla de mejores puntuaciones (`leaderboard`).
- Reproductor: HUD (jugador, puntuación, vidas, nivel), marco CRT con arena visual estática (nave, enemigos, piso con grilla — solo CSS, sin animación de partida), botones Pausa/Fin/Salir, modal de fin de juego con input de iniciales y botón "Guardar puntuación".
- Salón de la fama: tabs por juego, podio (oro/plata/bronce), tabla completa de puntuaciones, fila "tu mejor marca" cuando hay sesión iniciada.
- Autenticación: tabs "Iniciar sesión" / "Crear cuenta", formulario, botón "Jugar como invitado", botones sociales decorativos (Google/GitHub, sin integración real).
- Contexto de sesión de usuario en cliente (React Context) respaldado por `localStorage`, consumido por `Nav`, `Auth`, `Reproductor` y `Salón de la Fama`.
- Datos mock (`GAMES`, `CATS`, `seededScores`) portados a un archivo TypeScript estático.
- Guardado de puntaje del modal de fin de juego en `localStorage`, con valor de puntuación fijo (mock) ya que no hay partida real.
- Diseño responsive igual al del template (breakpoints ya definidos en `globals.css`, que ya contiene el CSS del template portado 1:1).

**Out of scope (for future specs):**

- Cualquier lógica de juego real (colisiones, físicas, input de teclado/táctil dentro del CRT, puntuación que sube con el tiempo).
- Autenticación real contra backend, OAuth funcional con Google/GitHub, o cualquier API/base de datos.
- Persistencia de puntuaciones global/compartida entre usuarios (el `localStorage` es solo del navegador local).
- Validación de formularios de auth (formato de email, fuerza de contraseña, mensajes de error).
- Internacionalización (todo queda en español, igual que el template).
- Sistema de créditos/monedas funcional (el contador "CRÉDITOS · 03" permanece estático).

---

## Data model

```ts
// lib/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string; // clase CSS de portada, ej. "cover-bricks"
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;
}

export const GAMES: Game[];
export const CATS: readonly ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/AAAA"
}

export function seededScores(seed: number, count?: number): ScoreRow[];
```

```ts
// lib/user-context.tsx
export interface SessionUser {
  name: string;
}

// Contexto React con: user: SessionUser | null, login(user: SessionUser | null): void, signOut(): void
// Persistido en localStorage bajo la clave "av_user" (mismo nombre que el template).
```

```ts
// Guardado de puntaje mock (modal de fin de juego), en localStorage bajo "av_scores":
interface SavedScoreEntry {
  game: string; // id del juego
  score: number; // valor mock fijo, ej. 12450
  name: string;
  at: number; // Date.now()
}
```

Convenciones:

- Los ids de ruta (`[id]`) son los mismos `id` de `GAMES` (ej. `bloque-buster`).
- Si `[id]` no existe en `GAMES`, la página de detalle/reproductor debe usar `notFound()` de Next.js.
- El puntaje final mostrado en el modal de fin de juego es un valor fijo por juego (no aleatorio), por ejemplo `Math.floor(game.best * 0.4)`, para que se vea realista sin simular una partida.

---

## Implementation plan

1. Crear `lib/games.ts` portando `GAMES`, `CATS`, `PLAYERS` y `seededScores` desde `references/templates/data.jsx` a TypeScript tipado.
2. Crear `lib/user-context.tsx` con un `UserProvider` (client component) que expone `user`, `login`, `signOut`, sincronizado con `localStorage["av_user"]`. Envolver `app/layout.tsx` con este provider.
3. Crear `components/Nav.tsx` (client component) replicando `nav.jsx`: logo, links con estado activo vía `usePathname`, contador de créditos, botón de sesión (usa `UserProvider`), menú móvil con backdrop. Montarlo en `app/layout.tsx` sobre `{children}`.
4. Crear `components/GameCard.tsx` (client component, por el tilt con `onMouseMove`) y `components/Library.tsx` (client component: búsqueda + filtro de categoría). Reescribir `app/page.tsx` para renderizar `<Library games={GAMES} />`.
5. Crear `app/juegos/[id]/page.tsx` (server component): busca el juego en `GAMES`, llama `notFound()` si no existe, calcula `seededScores` y renderiza la vista de detalle con `<Link>` hacia `/juegos/[id]/jugar` y `/`.
6. Crear `components/GamePlayer.tsx` (client component) y `app/juegos/[id]/jugar/page.tsx`: HUD estático, marco CRT sin animación de partida, botón Pausa que solo alterna el overlay "EN PAUSA", botón Fin que abre el modal con el puntaje mock fijo, guardado en `localStorage["av_scores"]` vía `UserProvider`/helper propio, botón Salir que navega a `/juegos/[id]`.
7. Crear `components/HallOfFame.tsx` (client component: estado de tab) y `app/salon/page.tsx`: podio, tabla completa, fila "tu mejor marca" condicionada a `user` del contexto.
8. Crear `components/AuthForm.tsx` (client component) y `app/auth/page.tsx`: tabs login/registro, formulario, botón invitado, botones sociales decorativos; al enviar, llama `login()` del contexto y navega a `/`.
9. Revisar `app/page.tsx` (placeholder actual) y ajustar `app/layout.tsx`/`globals.css` si falta alguna clase usada por los nuevos componentes (el CSS del template ya está portado 1:1 en `globals.css`).

Cada paso deja la app corriendo con `npm run dev` sin errores de consola ni de build.

---

## Acceptance criteria

- [x] `npm run build` compila sin errores de tipos ni de lint.
- [x] `/` muestra el hero, buscador, chips de categoría y la grilla de juegos; filtrar por texto o categoría reduce la grilla en tiempo real.
- [x] Buscar un término sin coincidencias muestra el estado "NO HAY RESULTADOS".
- [x] Click en una `GameCard` (o su botón "JUGAR") navega a `/juegos/[id]`.
- [x] `/juegos/[id]` muestra portada, tags, descripción, estadísticas y la tabla de mejores puntuaciones para ese juego.
- [x] Visitar `/juegos/id-inexistente` muestra la página 404 de Next.js.
- [x] Botón "Jugar ahora" en detalle navega a `/juegos/[id]/jugar`; "Volver al vault" navega a `/`.
- [x] `/juegos/[id]/jugar` muestra el HUD y el marco CRT sin que la puntuación cambie sola (sin `setInterval`).
- [x] Botón "Pausa" alterna el overlay "EN PAUSA" sobre la pantalla CRT.
- [x] Botón "Fin" abre el modal de fin de juego con un puntaje fijo mostrado.
- [x] Ingresar iniciales y pulsar "Guardar puntuación" en el modal escribe una entrada en `localStorage["av_scores"]` y muestra el mensaje "PUNTUACIÓN GUARDADA".
- [x] Botón "Salir" en el reproductor navega de vuelta a `/juegos/[id]`.
- [x] `/salon` muestra tabs por juego; cambiar de tab actualiza podio y tabla.
- [x] Con sesión iniciada, `/salon` muestra la fila "TU MEJOR MARCA EN {juego}"; sin sesión, esa fila no aparece.
- [x] `/auth` permite alternar entre "Iniciar sesión" y "Crear cuenta"; enviar el formulario o pulsar "Jugar como invitado" inicia sesión y navega a `/`.
- [x] Tras iniciar sesión, el botón de la Nav cambia de "Iniciar Sesión" a mostrar el nombre de usuario, y persiste tras recargar la página (F5).
- [x] Cerrar sesión desde el botón de usuario en la Nav borra `localStorage["av_user"]` y vuelve a mostrar "Iniciar Sesión".
- [x] En viewport móvil (<840px), la Nav oculta los links y muestra el botón hamburguesa; abrirlo despliega el panel lateral con backdrop.
- [x] El link activo en la Nav (`biblioteca`/`salon`) se resalta en cian según la ruta actual, incluyendo cuando se está en `/juegos/[id]` o `/juegos/[id]/jugar` (se resalta "Biblioteca").

---

## Decisions

- **Sí:** Rutas reales de App Router en vez de hash-routing. Aprovecha la infraestructura de Next.js (layouts, `notFound()`, navegación nativa) en vez de replicar un router casero.
- **No:** Router de una sola página con `location.hash`. Contradice el uso de App Router pedido por el proyecto.
- **Sí:** Reproductor solo con layout estático, sin `setInterval` que suba el puntaje. El spec es explícitamente "solo la parte visual, sin juegos"; simular una partida con puntaje creciente cruza esa línea.
- **Sí:** Puntaje final del modal de fin de juego como valor fijo derivado de `game.best` (no aleatorio, no en tiempo real), para que el modal se vea realista sin lógica de juego.
- **Sí:** `localStorage` para sesión de usuario y puntajes guardados, con las mismas claves del template (`av_user`, `av_scores`). Mantiene el comportamiento demo del prototipo sin requerir backend.
- **No:** Backend/API real para auth o puntuaciones. Fuera del alcance de un MVP "solo visual".
- **Sí:** Contexto de React (`UserProvider`) en vez de prop-drilling manual como hacía `app.jsx`. Con rutas reales, el estado de sesión debe compartirse entre `layout.tsx` (Nav) y páginas independientes, no un único árbol de componentes.
- **Sí:** Datos mock en `lib/games.ts` como archivo estático importado directamente. No se necesita una capa de red para datos que no cambian.
- **No:** Route handlers (`app/api/`) para servir los datos mock. Añaden una vuelta HTTP innecesaria para datos estáticos locales.
- **Sí:** Reutilizar el CSS ya portado en `app/globals.css` (idéntico a `references/templates/styles.css`) en vez de reescribir a utilidades de Tailwind. Ya está portado y funcionando; reescribirlo sería trabajo no pedido.

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Hydration mismatch: `UserProvider` lee `localStorage["av_user"]` que no existe en el servidor, así que el primer render server-side siempre es "sin sesión" y puede diferir del render cliente si había sesión guardada. | Inicializar `user` en `null` durante SSR y leer `localStorage` recién en un `useEffect` tras el montaje; la Nav muestra "Iniciar Sesión" por una fracción de segundo antes de reflejar la sesión real. Documentar el parpadeo como aceptable para este MVP. |
| Next.js 16.3.5 cambia convenciones de App Router respecto al training data (p. ej. `params` como `Promise` en rutas dinámicas, manejo de `notFound()`, Server/Client Components). Escribir código con supuestos desactualizados rompe el build. | Antes de tocar `app/juegos/[id]/page.tsx` y `app/juegos/[id]/jugar/page.tsx`, leer `node_modules/next/dist/docs/01-app/01-getting-started/` y `03-api-reference/` como indica `AGENTS.md`. |
| `localStorage` deshabilitado o no disponible (modo privado, políticas del navegador) hace que `login`/`signOut`/guardado de puntaje lancen excepción o simplemente no persistan. | Envolver los accesos a `localStorage` en try/catch (igual que el template) y degradar a estado solo en memoria sin romper la UI. |
| El resaltado de "activo" en la Nav depende de mapear rutas anidadas (`/juegos/[id]`, `/juegos/[id]/jugar`) al link "Biblioteca" vía `usePathname`. Si la estructura de rutas cambia más adelante (spec de juegos reales), esa lógica puede desincronizarse silenciosamente. | Centralizar la función de matching de rutas activas en un solo lugar dentro de `Nav.tsx` con un test manual explícito en los criterios de aceptación (ya cubierto arriba). |
| Tailwind v4 (`@import "tailwindcss"`) conviviendo con el CSS con clases propias portado del template puede introducir conflictos de especificidad o un reset que pise estilos del template. | Verificar visualmente cada pantalla tras portar el CSS; si aparecen conflictos, ajustar únicamente las reglas afectadas en `globals.css` sin reescribir el resto. |

---

## What is **not** in this spec

- Cualquier juego jugable (Bloque Buster, Caída, Serpentina, Glotón, Invasores, Rocas, Ranaria, Duelo Pixel).
- Autenticación real, backend, base de datos o API externa.
- Sistema de créditos/monedas funcional.
- Validación de formularios y manejo de errores de red.
- Internacionalización.

Cada uno de estos, si se implementa, va en su propio spec.
