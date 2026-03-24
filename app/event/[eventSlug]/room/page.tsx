import { Suspense } from "react";

import EventRoomGate from "./EventRoomGate";

export default function EventRoomPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-6">
          <p className="text-sm text-zinc-400">Loading…</p>
        </main>
      }
    >
      <EventRoomGate />
    </Suspense>
  );
}
