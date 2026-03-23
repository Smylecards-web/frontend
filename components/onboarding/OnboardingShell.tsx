import type { ReactNode } from "react";

import { theme } from "@/theme";

type OnboardingShellProps = {
  children: ReactNode;
};

export function OnboardingShell({ children }: OnboardingShellProps) {
  return (
    <div
      className="flex min-h-dvh w-full flex-col font-sans text-white antialiased"
      style={{ backgroundColor: theme.colors.brand }}
    >
      {children}
    </div>
  );
}
