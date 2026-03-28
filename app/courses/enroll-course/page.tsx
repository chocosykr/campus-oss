import { enrollCourse } from "@/lib/actions/enroll-course";

export default function EnrollCourse() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Join Course
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Enter the course join code provided by your instructor.
        </p>

        <form action={enrollCourse} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Join Code
            </label>

            <input
              type="text"
              name="joinCode"
              placeholder="e.g. CS101-AB12"
              required
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Join Course
          </button>
        </form>

      </div>
    </div>
  );
}