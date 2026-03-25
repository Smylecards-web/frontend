import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import logoFull from "@/assets/icons/Logo transparents (1).png";
import { appButtonPrimary, appPageLead, appPageTitle } from "@/lib/appUi";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Create unforgettable events with Smylecards and invite guests to one shared memory room.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 app-pad-y">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.3),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.2),transparent_35%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-7 text-center">
        <div className="flex justify-center">
          <Image
            src={logoFull}
            alt="Smylecards"
            className="h-11 w-auto max-w-[min(85vw,280px)] object-contain object-center sm:h-14"
            priority
            sizes="(max-width: 640px) 85vw, 280px"
          />
        </div>
        <h1 className={`${appPageTitle} text-4xl leading-tight sm:text-5xl`}>
          Turn your event into a shared memory room.
        </h1>
        <p className={appPageLead}>
          Create your event, invite guests by QR or link, and keep every moment
          in one beautiful place.
        </p>
        <Link
          href="/host/start"
          className={`${appButtonPrimary} hover:scale-[1.01]`}
        >
          Create Event
        </Link>
      </div>
    </section>
  );
}
