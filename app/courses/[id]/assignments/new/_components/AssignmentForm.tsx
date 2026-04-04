"use client";

import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  FileText, 
  Code2, 
  CalendarIcon, 
  ArrowLeft, 
  Beaker,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}

interface AssignmentFormProps {
  action: (formData: FormData) => Promise<void>;
}

export function AssignmentForm({ action }: AssignmentFormProps) {
  const params = useParams();
  const courseId = params.id as string;

  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", expectedOutput: "", hidden: false },
  ]);
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", hidden: false }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value } as TestCase;
    setTestCases(updated);
  };

  // Style Guide Classes
  const inputBase = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:ring-white";
  const labelBase = "text-sm font-medium text-zinc-600 dark:text-zinc-400";
  const sectionLabel = "text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2";

  return (
    <form action={action} className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link
          href={`/courses/${courseId}`}
          className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Course
        </Link>
        
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Create Assignment
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Define the problem statement, environment, and automated test suite.
          </p>
        </div>
      </div>

      {/* Basic Details Section */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className={sectionLabel}>
          <FileText className="h-3.5 w-3.5" />
          General Configuration
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <label className={labelBase}>Assignment Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Memory Management in C++"
              className={inputBase}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className={labelBase}>Instructions</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Provide a detailed description of the task..."
              className={`${inputBase} resize-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={labelBase}>Runtime Language</label>
            <div className="relative">
              <select name="language" className={`${inputBase} appearance-none`}>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelBase}>Submission Deadline</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`${inputBase} flex items-center justify-between text-left`}
                >
                  <span className={dueDate ? "text-zinc-900 dark:text-white" : "text-zinc-400"}>
                    {dueDate ? format(dueDate, "PPP p") : "Select date & time"}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-zinc-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm" align="end">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
                <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
                  <input
                    type="time"
                    className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    onChange={(e) => {
                      if (!dueDate) return;
                      const [h, m] = e.target.value.split(":").map(Number);
                      const newDate = new Date(dueDate);
                      newDate.setHours(h);
                      newDate.setMinutes(m);
                      setDueDate(newDate);
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <input type="hidden" name="dueDate" value={dueDate?.toISOString() || ""} />
          </div>
        </div>
      </section>

      {/* Starter Code Section */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className={sectionLabel}>
          <Code2 className="h-3.5 w-3.5" />
          Environment Boilerplate
        </h2>
        <div className="space-y-2">
          <label className={labelBase}>Starter Code (Optional)</label>
          <div className="rounded-xl border border-zinc-200 overflow-hidden dark:border-zinc-800">
            <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Editor Preview
            </div>
            <textarea
              name="starterCode"
              rows={8}
              placeholder="// Write starter code here..."
              className="w-full bg-zinc-950 p-5 text-sm text-emerald-400 font-mono focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </section>

      {/* Test Cases Section */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className={sectionLabel + " mb-0"}>
            <Beaker className="h-3.5 w-3.5" />
            Automated Test Suite
          </h2>
          <button
            type="button"
            onClick={addTestCase}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Case
          </button>
        </div>

        <div className="space-y-4">
          {testCases.map((tc, index) => (
            <div key={index} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                  Case #0{index + 1}
                </span>
                {testCases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTestCase(index)}
                    className="text-zinc-400 transition-colors hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase">Input</label>
                  <textarea
                    value={tc.input}
                    name={`testCase_input_${index}`}
                    onChange={(e) => updateTestCase(index, "input", e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-3 font-mono text-xs focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-white"
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase">Expected Output</label>
                  <textarea
                    value={tc.expectedOutput}
                    name={`testCase_expectedOutput_${index}`}
                    onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-3 font-mono text-xs focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`hidden_${index}`}
                  name={`testCase_hidden_${index}`}
                  checked={tc.hidden}
                  onChange={(e) => updateTestCase(index, "hidden", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800"
                />
                <label htmlFor={`hidden_${index}`} className="text-xs text-zinc-500">
                  Hidden test case (only visible to instructors)
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Create Assignment
        </button>
      </div>
    </form>
  );
}