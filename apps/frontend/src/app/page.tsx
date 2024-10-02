import { routeMap } from "@/lib/constants";
import Link from "next/link";

export default function Home() {
  return (
    <main className="px-10">
      <div className="flex gap-10 py-8">
        <Link href={routeMap.boards}>Boards</Link>
        <Link href={routeMap.login}>Login</Link>
        <Link href={routeMap.register}>Register</Link>
      </div>
    </main>
  );
}
