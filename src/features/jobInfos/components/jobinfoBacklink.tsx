import { BackLink } from "@/components/ui/BackLink";
import { cn } from "@/lib/utils";
import { cacheTag } from "next/cache";
import { Suspense } from "react";
import { getjobInfoIdtag } from "../dbcache";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { jobInfoTable } from "@/drizzle/schema";

export function JobInfoBacklink({
  jobInfoId,
  className,
}: {
  jobInfoId: string;
  className?: string;
}) {
  return (
    <BackLink
      href={`/app/job-infos/${jobInfoId}`}
      className={cn("mb-4", className)}
    >
      <Suspense fallback="job Description">
        <JobName jobInfoId={jobInfoId} />
      </Suspense>
    </BackLink>
  );
}

async function JobName({ jobInfoId }: { jobInfoId: string }) {
  const jobInfo = await getjobInfo(jobInfoId);
  return jobInfo?.name ?? "Job Description";
}

async function getjobInfo(id: string) {
  "use cache";
  cacheTag(getjobInfoIdtag(id));
return db.query.jobInfoTable.findFirst({
    where: eq(jobInfoTable.id, id),
  });
}
