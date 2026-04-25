import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <Suspense
        fallback={
          <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            Loading login...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}