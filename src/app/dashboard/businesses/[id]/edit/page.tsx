import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EditBusinessForm from "@/components/business/EditBusinessForm";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "OWNER") {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">Edit Business</h1>
      <p className="mt-3 text-gray-600">
        Update your business details below.
      </p>

      <div className="mt-8">
        <EditBusinessForm businessId={id} />
      </div>
    </div>
  );
}