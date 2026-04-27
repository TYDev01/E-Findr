import { requireCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireCurrentUser();
  return children;
}
