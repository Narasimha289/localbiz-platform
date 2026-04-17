import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          LocalBiz
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/businesses">Businesses</Link>
          <Link href="/register">Register</Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}