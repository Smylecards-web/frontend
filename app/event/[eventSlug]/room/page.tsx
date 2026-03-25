import { Suspense } from "react";
import type { Metadata } from "next";

import EventRoomGate from "./EventRoomGate";

type EventRoomPageProps = {
  params: Promise<{ eventSlug: string }>;
};

export async function generateMetadata({
  params,
}: EventRoomPageProps): Promise<Metadata> {
  const { eventSlug } = await params;

  return {
    title: `Event Room ${eventSlug}`,
    description: "Private Smylecards event room.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function EventRoomPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 app-pad-y">
          <p className="text-sm text-zinc-400">Loading…</p>
        </main>
      }
    >
      <EventRoomGate />
    </Suspense>
  );
}
