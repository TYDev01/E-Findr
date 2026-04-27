import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { Panel, Section } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <Section className="flex min-h-screen items-center py-12">
      <Panel className="mx-auto grid w-full max-w-5xl overflow-hidden p-0 md:grid-cols-2">
        <div className="mesh-card p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-fern">Organizer access</p>
          <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-5xl font-bold leading-tight">Step back into your event command center.</h1>
          <p className="mt-5 text-sm leading-7 text-ink/68">Track indexing, share private galleries, and manage deletions without exposing raw uploads.</p>
        </div>
        <div className="p-8 md:p-10">
          <AuthForm mode="login" />
        </div>
      </Panel>
    </Section>
  );
}
