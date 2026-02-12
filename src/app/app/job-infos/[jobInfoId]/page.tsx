import { Skeleton } from "@/components/Skeleton";
import { SuspensedItem } from "@/components/SuspenseItem";
import { BackLink } from "@/components/BackLink";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle ,CardDescription,CardContent} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { jobInfoTable } from "@/drizzle/schema";
import { getjobInfoIdtag } from "@/features/jobInfos/dbcache";
import { getcurrentUser } from "@/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { ArrowRightIcon } from "lucide-react";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

const options = [
  {
    label: "Answer Technical Questions",
    description:
      "Challenge yourself with practice questions tailored to your job description.",
    href: "questions",
  },
  {
    label: "Practice Interviewing",
    description: "Simulate a real interview with AI-powered mock interviews.",
    href: "interviews",
  },
  {
    label: "Refine Your Resume",
    description:
      "Get expert feedback on your resume and improve your chances of landing an interview.",
    href: "resume",
  },
  {
    label: "Update Job Description",
    description: "This should only be used for minor updates.",
    href: "edit",
  },
];

export default async function JobInfoPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  const jobInfo = getcurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const jobinfo = await getjobInfo(jobInfoId, userId);

      if (jobInfo == null) return notFound();

      return jobinfo;
    },
  );

  return (
    <div className="container my-4 space-y-5">
      <BackLink href="/app">Dashboard</BackLink>
      <div className="space-y-6">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl">
              <SuspensedItem
                item={jobInfo}
                fallback={<Skeleton className="w-48" />}
                result={(j) => j?.name}
              />
            </h1>

            <div className="flex gap-2">
              <SuspensedItem
                item={jobInfo}
                fallback={null}
                result={(j) => (
                  <Badge variant="secondary">{j?.experiencelevel}</Badge>
                )}
              />

              <SuspensedItem
                item={jobInfo}
                fallback={null}
                result={(j) => {
                  return (
                    j?.title && <Badge variant="default">{j?.title}</Badge>
                  );
                }}
              />
            </div>

            <p className="text-muted-foreground line-clamp-3">
              <SuspensedItem
                item={jobInfo}
                fallback={<Skeleton className="w-96" />}
                result={(j) => j?.description}
              />
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
          {options.map((opt) => (
            <Link
              className="hover:scale-[1.02] transition-[transform_opacity]"
              href={`/app/job-infos/${jobInfoId}/${opt.href}`}
              key={opt.href}
            >
              <Card className="h-full flex items-start justify-between flex-row">
                <CardHeader className="grow">
                  <CardTitle>{opt.label}</CardTitle>
                <CardDescription>{opt.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

async function getjobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getjobInfoIdtag(id));

  return db.query.jobInfoTable.findFirst({
    where: and(eq(jobInfoTable.id, id), eq(jobInfoTable.userId, userId)),
  });
}
