import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { jobInfoTable } from "@/drizzle/schema";
import { JobInfoBacklink } from "@/features/jobInfos/components/jobinfoBacklink";
import { getjobInfoIdtag } from "@/features/jobInfos/dbcache";
import { eq, and } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getcurrentUser } from "@/services/lib/getCurrentUser";
import { notFound } from "next/navigation";
import { JobInform } from "@/features/jobInfos/components/jobInfoform";

export default async function JobInfoNewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <JobInfoBacklink jobInfoId={jobInfoId} />
      <h1 className="text-3xl md:text-4xl">Edit Job Description</h1>
      <Card>
        <CardContent>
          <Suspense
            fallback={<Loader2 className="size-24 animate-spin mx-auto" />}
          >
            <SuspenseForm jobInfoId={jobInfoId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspenseForm({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getcurrentUser();

  if (userId == null) return redirectToSignIn();
  const jobInfo = await getjobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return <JobInform jobInfo={jobInfo} />;
}

async function getjobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getjobInfoIdtag(id));
  return db.query.jobInfoTable.findFirst({
    where: and(eq(jobInfoTable.id, id), eq(jobInfoTable.userId, userId)),
  });
}
