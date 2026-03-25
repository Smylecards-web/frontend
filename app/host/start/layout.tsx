import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host Start",
  description:
    "Start hosting your event on Smylecards, verify your account, and generate your invite link.",
  alternates: {
    canonical: "/host/start",
  },
};

export default function HostStartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
