"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          LocalBiz
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/businesses">Businesses</Link>

          {!session?.user ? (
            <>
              <Link href="/register">Register</Link>
              <Link href="/login">Login</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button
                onClick={() => signOut({ redirectTo: "/" })}
                className="rounded-lg border border-gray-300 px-3 py-2"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}