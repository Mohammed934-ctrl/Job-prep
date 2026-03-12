import { db } from "@/drizzle/db";
import { jobInfoTable } from "@/drizzle/schema";
import { getjobInfoIdtag } from "@/features/jobInfos/dbcache";
import { canRunResumeAnalysis } from "@/features/resume/permission";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { getcurrentUser } from "@/lib/getCurrentUser";
import { analyzeResumeForJob } from "@/services/ai/resumes/ai";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

export async function POST(req: Request) {
  const { userId } = await getcurrentUser();
  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const formData = await req.formData();

  const ResumeFile = formData.get("resumeFile") as File;
  const jobInfoId = formData.get("jobInfoId") as string;

  if (!ResumeFile || !jobInfoId) {
    return new Response("Invalid request", { status: 400 });
  }

  if (ResumeFile.size > 10 * 1024 * 1024) {
    return new Response("File size exceeds 10MB limit", { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!allowedTypes.includes(ResumeFile.type)) {
    return new Response("Please upload a PDF, Word document, or text file", {
      status: 400,
    });
  }

  const jobInfo = await getjobinfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  if (!(await canRunResumeAnalysis())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
  }

  const result = await analyzeResumeForJob({
    resumeFile: ResumeFile,
    jobInfo,
  });

  return Response.json(result);
}

async function getjobinfo(id: string, userId: string) {
  "use cache";
  cacheTag(getjobInfoIdtag(id));

  return db.query.jobInfoTable.findFirst({
    where: and(eq(jobInfoTable.id, id), eq(jobInfoTable.userId, userId)),
  });
}
