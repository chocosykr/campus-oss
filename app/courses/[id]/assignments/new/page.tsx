import { createAssignment } from "@/lib/actions/assignments";
import { AssignmentForm } from "./_components/AssignmentForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewAssignmentPage({ params }: PageProps) {
  const { id } = await params;
  const action = createAssignment.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AssignmentForm action={action} />
    </div>
  );
}