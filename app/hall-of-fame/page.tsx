import type { Metadata } from "next";
import HallOfFame from "@/components/HallOfFame";

export const metadata: Metadata = { title: "Salón de la Fama — Arcade Vault" };

export default function HallOfFamePage() {
  return <HallOfFame />;
}
