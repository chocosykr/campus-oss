"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset to page 1 on new search

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  return (
    <div className="relative max-w-sm">
      <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isPending ? "text-zinc-300 animate-pulse" : "text-zinc-400"}`} />
      <input
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={defaultValue}
        placeholder="Search courses…"
        className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-white"
      />
    </div>
  );
}