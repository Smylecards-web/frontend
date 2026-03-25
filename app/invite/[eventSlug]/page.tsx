import { Suspense } from "react";
import type { Metadata } from "next";

import InvitationGate from "./InvitationGate";

type InvitationPageProps = {
  params: Promise<{ eventSlug: string }>;
};

export async function generateMetadata({
  params,
}: InvitationPageProps): Promise<Metadata> {
  const { eventSlug } = await params;

  return {
    title: `Invitation ${eventSlug}`,
    description: "Private invitation room on Smylecards.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function InvitationPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen bg-zinc-950">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(82,82,91,0.6),rgba(9,9,11,0.95))]" />
          <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 app-pad-y">
            <p className="text-sm text-zinc-300">Loading…</p>
          </div>
        </main>
      }
    >
      <InvitationGate />
    </Suspense>
  );
}
