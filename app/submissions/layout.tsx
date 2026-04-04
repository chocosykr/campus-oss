import AppShell from "@/components/layout/AppShell";

export default function SubmissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}