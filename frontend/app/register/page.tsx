import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { Panel, Section } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth.server";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <Section className="flex min-h-screen items-center py-12">
      <Panel className="mx-auto w-full max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-fern">Create organizer account</p>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-5xl font-bold">Launch a private gallery in minutes.</h1>
        <div className="mt-8">
          <AuthForm mode="register" />
        </div>
      </Panel>
    </Section>
  );
}
