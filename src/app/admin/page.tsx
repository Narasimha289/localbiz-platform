import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PendingBusinessesList from "@/components/admin/PendingBusinessesList";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="mt-3 text-gray-600">
        Review and manage pending business submissions.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 p-6 shadow-sm">
        <p><strong>Admin:</strong> {session.user.name}</p>
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>Role:</strong> {session.user.role}</p>
      </div>

      <div className="mt-10">
        <PendingBusinessesList />
      </div>
    </div>
  );
}