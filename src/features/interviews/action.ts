"use server";

import { getcurrentUser } from "@/lib/getCurrentUser";
import { cacheTag } from "next/cache";
import { getjobInfoIdtag } from "../jobInfos/dbcache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { InterviewTable, jobInfoTable } from "@/drizzle/schema";
import { InsertInterview, updateInterview as updateInterviewDB } from "./db";
import { getInterviewIdTag } from "./dbCache";

export async function createInterview({
  jobinfoid,
}: {
  jobinfoid: string;
}): Promise<{ error: true; message: string } | { error: false; id: string }> {
  const { userId } = await getcurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const jobInfo = await getjobInfo(jobinfoid, userId);
  if (jobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const Interview = await InsertInterview({ jobinfoid, duration: "00:00:00" });

  return { error: false, id: Interview.id };
}

export async function updateInteview(
  id: string,
  data: { humechat?: string; duration?: string },
) {
  const { userId } = await getcurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInteview(id, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  await updateInterviewDB(id, data);

  return { error: false };
}

async function getjobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getjobInfoIdtag(id));
  return db.query.jobInfoTable.findFirst({
    where: and(eq(jobInfoTable.id, id), eq(jobInfoTable.userId, userId)),
  });
}

async function getInteview(id: string, userId: string) {
  "use cache";
  cacheTag(getInterviewIdTag(id));
  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
          description: true,
          title: true,
          experiencelevel: true,
        },
      },
    },
  });
  if (interview == null) return null;
  cacheTag(getjobInfoIdtag(interview.jobInfo.id));

  if (interview.jobInfo.userId == null) return null;

  return interview;
}
