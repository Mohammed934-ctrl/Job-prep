"use client";

import { getUser } from "@/features/user/action";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function OnboardingClientpage({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    const intervalid = setInterval(async () => {
      const user = await getUser(userId);
      if (user == null) return;

      router.replace("/app");
      clearInterval(intervalid);
    }, 250);

    return () => {
      clearInterval(intervalid);
    };
  }, [userId, router]);

  return <Loader2 className="animate-spin size-24" />;
}
