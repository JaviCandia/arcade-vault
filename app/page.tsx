import Library from "@/components/Library";
import { GAMES } from "@/lib/games";

export default function Home() {
  return <Library games={GAMES} />;
}
