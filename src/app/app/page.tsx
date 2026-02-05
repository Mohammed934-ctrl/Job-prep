import { db } from "@/drizzle/db";
import { jobInfoTable } from "@/drizzle/schema";
import { getUserjobInfotag } from "@/features/jobInfos/dbcache";
import { getcurrentUser } from "@/services/lib/getCurrentUser";
import { desc, eq } from "drizzle-orm";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/cache";
import { Suspense } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobInform } from "@/features/jobInfos/components/jobInfoform";

export default function Apppage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2Icon className="size-16 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <JobInfos />
    </Suspense>
  );
}

async function JobInfos() {
  const { userId, redirectToSignIn } = await getcurrentUser();
  if (!userId) return redirectToSignIn();

  const jobInfos = await getjobInfos(userId);
  if (jobInfos.length === 0) {
    return <NojobInfos />;
  }

  return (
    <div className="container my-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold">
          Select a job description
        </h1>

        <Button asChild>
          <Link href="/app/job-infos/new" className="flex items-center gap-2">
            <PlusIcon className="size-4" />
            Create Job Description
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobInfos.map((job) => (
          <Link
            key={job.id}
            href={`/app/job-infos/${job.id}`}
            className="hover:scale-[1.02] transition-transform"
          >
            <Card className="h-full hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-1">
                  {job.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground line-clamp-3">
                {job.description}
              </CardContent>

              <CardFooter className="flex flex-wrap gap-2">
                <Badge variant="secondary">{job.experiencelevel}</Badge>
                {job.title && <Badge>{job.title}</Badge>}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      <Link href="/app/job-infos/new">
        <Card className="h-full  flex items-center justify-center border-dashed border-2 bg-transparent hover:border-primary/50 transition-colors shadow-none">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PlusIcon className="size-5" />
            New Job Description
          </div>
        </Card>
      </Link>
    </div>
  );
}

function NojobInfos() {
  return (
    <div className="container max-w-4xl my-10 space-y-6">
      <h1 className="text-4xl font-semibold text-primary">
        Welcome to Job-Prep
      </h1>

      <p className="text-muted-foreground">
        To get started, enter information about the job you want to apply for.
        You can paste details from a real job listing or describe your ideal
        role and tech stack. The more specific you are, the better your mock
        interviews will be.
      </p>

      <JobInform />
    </div>
  );
}

async function getjobInfos(userId: string) {
  "use cache";
  cacheTag(getUserjobInfotag(userId));

  return db.query.jobInfoTable.findMany({
    where: eq(jobInfoTable.userId, userId),
    orderBy: desc(jobInfoTable.updatedAt),
  });
}
