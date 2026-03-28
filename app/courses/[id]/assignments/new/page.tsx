import { createAssignment } from "@/lib/actions/assignments";

interface PageProps {
  params: Promise<{id: string}>
}

export default async function NewAssignmentPage({ params }: PageProps) {
  const { id } = await params;
  
  const action = createAssignment.bind(null, id);

  
    console.log("hi")
    console.log({id});
  return (
    <div className="mx-auto max-w-2xl space-y-6">
        
      <h1 className="text-2xl font-semibold">Create Assignment</h1>

      <form action={action} className="space-y-4">

        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            name="title"
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Language</label>
          <select
            name="language"
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Due Date</label>
          <input
            type="datetime-local"
            name="dueDate"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Starter Code</label>
          <textarea
            name="starterCode"
            rows={6}
            className="w-full rounded-md border px-3 py-2 font-mono"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          Create Assignment
        </button>
      </form>
    </div>
  );
}