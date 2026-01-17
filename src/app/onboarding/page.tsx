import { getcurrentUser } from "@/services/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { OnboardingClientpage } from "./client";

export default async function OnboardingPage() {
  const { userId, user } = await getcurrentUser({ allData: true });
  if (userId == null) return redirect("/");
  if (user != null) return redirect("/app");

  return (
    <div className="flex justify-center items-center flex-col h-screen gap-4">
      <h1 className="text-4xl">Creating your account...</h1>
       <OnboardingClientpage userId={userId}/>
    </div>
  );
}
