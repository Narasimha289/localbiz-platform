import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">LocalBiz</h2>
            <p className="mt-3 text-sm text-gray-600">
              A local business discovery and booking platform with payments,
              reviews, and owner dashboards.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-black">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/businesses" className="hover:text-black">
                  Businesses
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-black">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-black">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Project Info</h3>
            <p className="mt-3 text-sm text-gray-600">
              Built with Next.js, Prisma, PostgreSQL, Razorpay, Resend, and
              Tailwind CSS.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Location: Anantapur, Andhra Pradesh
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} LocalBiz. All rights reserved.
        </div>
      </div>
    </footer>
  );
}