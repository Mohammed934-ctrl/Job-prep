import { ReactNode } from "react";
import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes'

export function ClerkProvider({ children }: { children: ReactNode }) {
  return (
    <OriginalClerkProvider appearance={{
      theme:dark
    }}>
      {children}
    </OriginalClerkProvider>
  );
}
