import { db } from "@/drizzle/db";
import { jobInfoTable } from "@/drizzle/schema";
import { getjobInfoIdtag } from "@/features/jobInfos/dbcache";
import { getcurrentUser } from "@/lib/getCurrentUser";
import { eq, and } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuestionClientPage } from "./questionclientpage";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center h-screen items-center">
          <Loader2Icon className="animate-spin size-30" />
        </div>
      }
    >
      <SuspendedComponent jobInfoId={jobInfoId} />
    </Suspense>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getcurrentUser();

  if (userId == null) return redirectToSignIn();

  // Todo here we to have to call canCreatequestion

  const jobInfo = await getjobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return (
        <QuestionClientPage jobinfo={jobInfo}/>
    
  )
}

async function getjobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getjobInfoIdtag(id));

  return db.query.jobInfoTable.findFirst({
    where: and(eq(jobInfoTable.id, id), eq(jobInfoTable.userId, userId)),
  });
}
