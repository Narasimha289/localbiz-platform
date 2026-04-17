import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-3 text-gray-600">
        Welcome, {session.user.name ?? "User"}.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 p-6 shadow-sm">
        <p><strong>User ID:</strong> {session.user.id}</p>
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>Role:</strong> {session.user.role}</p>
      </div>

      {session.user.role === "OWNER" ? (
        <div className="mt-10">
          <h2 className="text-2xl font-bold">Create Your Business</h2>
          <p className="mt-2 text-gray-600">
            Add your business details to submit for admin approval.
          </p>

          <div className="mt-6">
            <CreateBusinessForm />
          </div>
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Customer Dashboard</h2>
          <p className="mt-2 text-gray-600">
            You are logged in as a customer. Business creation is available only for owner accounts.
          </p>
        </div>
      )}
    </div>
  );
}