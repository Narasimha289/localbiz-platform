import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-3 text-gray-600">
        Join as a customer or a business owner.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}