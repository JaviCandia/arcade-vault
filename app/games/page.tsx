import type { Metadata } from "next";
import Library from "@/components/Library";
import { GAMES } from "@/lib/games";

export const metadata: Metadata = { title: "Biblioteca — Arcade Vault" };

export default function GamesPage() {
  return <Library games={GAMES} />;
}
