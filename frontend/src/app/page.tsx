"use client";
import { routeMap } from "@/lib/constants";
import { fetchClient } from "@/lib/fetch-client";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    fetchClient.GET("/current-user").then((res) => console.log(res.data));
    fetchClient.GET("/boards").then((res) => console.log(res.data));
  }, []);
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
