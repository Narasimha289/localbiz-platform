"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          LocalBiz
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
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

              {session.user.role === "ADMIN" && (
                <Link href="/admin">Admin</Link>
              )}

              <button
                onClick={() => signOut({ redirectTo: "/" })}
                className="rounded-lg border border-gray-300 px-3 py-2"
              >
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile Button */}
        <button
          className="text-2xl md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="space-y-3 border-t px-4 py-4 md:hidden">
          <Link href="/" onClick={() => setIsOpen(false)} className="block">
            Home
          </Link>
          <Link
            href="/businesses"
            onClick={() => setIsOpen(false)}
            className="block"
          >
            Businesses
          </Link>

          {!session?.user ? (
            <>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="block"
              >
                Register
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block"
              >
                Dashboard
              </Link>

              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={() => signOut({ redirectTo: "/" })}
                className="block w-full text-left"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}