import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="mt-3 text-gray-600">
        Access your account to manage your activity.
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}