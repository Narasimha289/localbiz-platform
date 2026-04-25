import { auth } from "@/auth";
import { redirect } from "next/navigation";

import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import OwnerInquiriesList from "@/components/dashboard/OwnerInquiriesList";
import OwnerBusinessesList from "@/components/dashboard/OwnerBusinessesList";
import OwnerBookingsList from "@/components/dashboard/OwnerBookingsList";
import CustomerBookingsList from "@/components/dashboard/CustomerBookingsList";
import OwnerServicesManager from "@/components/dashboard/OwnerServicesManager";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Welcome, {session.user.name ?? "User"}
        </p>
      </div>

      {/* User Info Card */}
      <div className="mb-10 rounded-2xl border border-gray-200 p-4 shadow-sm sm:p-6">
        <p className="text-sm sm:text-base">
          <strong>User ID:</strong> {session.user.id}
        </p>
        <p className="text-sm sm:text-base">
          <strong>Email:</strong> {session.user.email}
        </p>
        <p className="text-sm sm:text-base">
          <strong>Role:</strong> {session.user.role}
        </p>
      </div>

      {/* OWNER */}
      {session.user.role === "OWNER" && (
        <div className="space-y-12">
          <section>
            <DashboardAnalytics />
          </section>

          <section>
            <h2 className="text-xl font-semibold">Create Business</h2>
            <div className="mt-4">
              <CreateBusinessForm />
            </div>
          </section>

          <section>
            <OwnerBusinessesList />
          </section>

          <section>
            <OwnerServicesManager />
          </section>

          <section>
            <OwnerInquiriesList />
          </section>

          <section>
            <OwnerBookingsList />
          </section>
        </div>
      )}

      {/* ADMIN */}
      {session.user.role === "ADMIN" && (
        <div className="space-y-12">
          <section>
            <DashboardAnalytics />
          </section>
        </div>
      )}

      {/* CUSTOMER */}
      {session.user.role === "CUSTOMER" && (
        <div className="space-y-12">
          <CustomerBookingsList />
        </div>
      )}
    </div>
  );
}