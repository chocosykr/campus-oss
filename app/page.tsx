import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] text-zinc-900" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Noise texture overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px' }}
      />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between border-b border-zinc-300/60 px-8 py-5 md:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-900">
            <span className="text-sm font-bold text-[#F5F2EB]">C</span>
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Campus OSS
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth/signin" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded bg-zinc-900 px-4 py-1.5 text-sm text-[#F5F2EB] transition-colors hover:bg-zinc-700"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-20 mx-auto max-w-5xl px-8 pb-24 pt-20 md:px-16 md:pt-32">

        {/* Eyebrow */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-px w-12 bg-zinc-400" />
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Open Source · Academic · Collaborative
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-5xl font-normal leading-[1.1] tracking-tight text-zinc-900 md:text-7xl"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
          Where campus projects
          <br />
          <em className="italic text-zinc-500">come to life.</em>
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-500"
          style={{ fontFamily: "'Georgia', serif" }}>
          A platform for instructors and students to manage courses, collaborate on projects, submit work, and give meaningful feedback — all in one place.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/auth/signup"
            className="rounded bg-zinc-900 px-6 py-3 text-sm font-medium text-[#F5F2EB] transition-all hover:bg-zinc-700 hover:shadow-lg"
          >
            Start for free
          </Link>
          <Link
            href="/auth/signin"
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 transition-colors"
          >
            Already have an account →
          </Link>
        </div>

        {/* Decorative rule */}
        <div className="mt-20 grid grid-cols-3 gap-px border border-zinc-300/60 bg-zinc-300/60 overflow-hidden rounded-lg">
          {[
            { number: "01", label: "Create courses & projects" },
            { number: "02", label: "Form teams & upload work" },
            { number: "03", label: "Review, grade & iterate" },
          ].map(({ number, label }) => (
            <div key={number} className="bg-[#F5F2EB] px-6 py-8">
              <span className="block text-3xl font-light text-zinc-300">{number}</span>
              <span className="mt-2 block text-sm leading-snug text-zinc-600">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-20 border-t border-zinc-300/60 bg-white/40 px-8 py-20 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-xs uppercase tracking-[0.2em] text-zinc-400">
            Everything your course needs
          </h2>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Course Management",
                desc: "Instructors create courses, add projects with deadlines, and track progress across all teams in one view.",
              },
              {
                title: "Team Collaboration",
                desc: "Students form teams, invite members by email, and work together under a shared project workspace.",
              },
              {
                title: "File Submissions",
                desc: "Drag-and-drop uploads with versioning. Every submission is tracked — nothing gets lost.",
              },
              {
                title: "Peer Review",
                desc: "Instructors score and comment on submissions. Students see their status and feedback instantly.",
              },
              {
                title: "Analytics",
                desc: "Visualise submission trends, team activity, and review throughput with built-in charts.",
              },
              {
                title: "Real-time Updates",
                desc: "Submit in one tab, watch the status update in another. Powered by Supabase Realtime.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="border-t border-zinc-200 pt-6">
                <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role split */}
      <section className="relative z-20 border-t border-zinc-300/60 px-8 py-20 md:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-px bg-zinc-300/60 overflow-hidden rounded-lg md:grid-cols-2">
            {/* Instructor */}
            <div className="bg-zinc-900 p-10 text-[#F5F2EB]">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">For Instructors</span>
              <h3 className="mt-4 text-2xl font-normal leading-snug" style={{ fontFamily: "'Georgia', serif" }}>
                Run your course,<br /><em>not your inbox.</em>
              </h3>
              <ul className="mt-6 space-y-2">
                {[
                  "Create courses and assign projects",
                  "Manage student teams",
                  "Review and grade submissions",
                  "Track analytics per course",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-8 inline-block rounded border border-zinc-600 px-5 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-400 hover:text-white"
              >
                Join as Instructor →
              </Link>
            </div>

            {/* Student */}
            <div className="bg-[#F5F2EB] p-10">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">For Students</span>
              <h3 className="mt-4 text-2xl font-normal leading-snug text-zinc-900" style={{ fontFamily: "'Georgia', serif" }}>
                Focus on the work,<br /><em className="text-zinc-500">not the admin.</em>
              </h3>
              <ul className="mt-6 space-y-2">
                {[
                  "Join courses and form teams",
                  "Upload and version your submissions",
                  "Get feedback from instructors",
                  "See your status in real time",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-500">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-8 inline-block rounded border border-zinc-300 px-5 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-500 hover:text-zinc-900"
              >
                Join as Student →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-20 border-t border-zinc-300/60 px-8 py-24 text-center md:px-16">
        <div className="mx-auto max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Get started today</p>
          <h2 className="mt-4 text-4xl font-normal text-zinc-900 md:text-5xl" style={{ fontFamily: "'Georgia', serif" }}>
            Your next project<br /><em className="text-zinc-500">starts here.</em>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded bg-zinc-900 px-8 py-3 text-sm font-medium text-[#F5F2EB] transition-all hover:bg-zinc-700 hover:shadow-lg"
            >
              Create an account
            </Link>
            <Link
              href="/auth/signin"
              className="rounded border border-zinc-300 px-8 py-3 text-sm text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-zinc-300/60 px-8 py-8 md:px-16">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-xs text-zinc-400">Campus OSS</span>
          <span className="text-xs text-zinc-400">Built with Next.js · Supabase · Prisma</span>
        </div>
      </footer>
    </div>
  );
}