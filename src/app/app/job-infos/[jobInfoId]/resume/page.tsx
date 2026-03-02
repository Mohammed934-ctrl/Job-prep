import { JobInfoBacklink } from "@/features/jobInfos/components/jobinfoBacklink";
import { canRunResumeAnalysis } from "@/features/resume/permission";
import { Loader2Icon } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ResumeClientPage } from "./ResumeClientpage";

export async function ResumePage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container flex flex-col items-start py-4 space-y-4 h-screen">
      <JobInfoBacklink jobInfoId={jobInfoId} />

      <Suspense
        fallback={<Loader2Icon className="animate-spin size-30 m-auto" />}
      >
        <SuspensedComponent jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspensedComponent({ jobInfoId }: { jobInfoId: string }) {
  if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade");

  return <ResumeClientPage jobInfoId={jobInfoId} />;
}
