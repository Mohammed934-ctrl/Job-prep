import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { getInterviewJobInfoTag } from "@/features/interviews/dbCache";
import { JobInfoBacklink } from "@/features/jobInfos/components/jobinfoBacklink";
import { getjobInfoIdtag } from "@/features/jobInfos/dbcache";
import { getcurrentUser } from "@/lib/getCurrentUser";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { ArrowRightIcon, AwardIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters";

export default async function InterviewsPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const {jobInfoId} = await params

  return (
    <div className="container py-4 gap-4 h-screen-header flex flex-col items-start">
      <JobInfoBacklink jobInfoId={jobInfoId} />
      <Suspense
        fallback={<Loader2Icon className="size-24 animate-spin m-auto" />}
      >
        <SuspensePage jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspensePage({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getcurrentUser();
  if (userId == null) return redirectToSignIn();

  const interviews = await getInterview(jobInfoId, userId);
  if (interviews.length === 0) {
    return redirect(`/app/job-infos/${jobInfoId}/interviews/new`);
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between gap-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">Interviews</h1>
        <Button asChild>
          <Link href={`/app/job-infos/${jobInfoId}/interviews/new`}>
            <PlusIcon />
            New Interview
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1  lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70 sapce-y-6">

        {interviews.map((interview) => (
          <Link
            href={`/app/job-infos/${jobInfoId}/interviews/${interview.id}`}
            key={interview.id}
          >
            <Card className="w-full">
              <div className="flex items-center justify-center h-full">
                <CardHeader className="gap-1 grow">
                  <CardTitle className="text-lg">{formatDateTime(interview.createdAt)}</CardTitle>
                  <CardDescription>{interview.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
       <Link
          href={`/app/job-infos/${jobInfoId}/interviews/new`}
          className="transition-opacity"
        >
          <Card className="h-full flex items-center justify-center border-dashed border-3 bg-transparent hover:border-primary/50 transition-colors shadow-none">
            <div className="text-lg flex items-center gap-2">
              <PlusIcon className="size-6" />
              New Interview
            </div>
          </Card>
        </Link>
    </div>
  );
}

async function getInterview(jobInfoId: string, userId: string) {
  "use cache";
  cacheTag(getInterviewJobInfoTag(jobInfoId));
  cacheTag(getjobInfoIdtag(jobInfoId));

  const data = await db.query.InterviewTable.findMany({
    where: and(
      eq(InterviewTable.jobinfoid, jobInfoId),
      isNotNull(InterviewTable.humechat),
  ),
    with: { jobInfo: { columns: { userId: true } } },
    orderBy: desc(InterviewTable.updatedAt),
  });

  return data.filter((interview) => interview.jobInfo?.userId === userId);
}