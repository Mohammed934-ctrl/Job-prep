"use server";

import { getcurrentUser } from "@/services/lib/getCurrentUser";

import { cacheTag } from "next/cache";
import { getjobInfoIdtag } from "../jobInfos/dbcache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { jobInfoTable } from "@/drizzle/schema";
import { InsertInterview } from "./db";

export async function createInterview({
  jobInfoId,
}: {
  jobInfoId: string;
}): Promise<{ error: true; message: string } | { error: false; id: string }> {
  const { userId } = await getcurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const jobInfo = await getjobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const Interview = await InsertInterview({ jobInfoId, duration: "00:00:00" });

  return { error: false, id: Interview.id };
}

async function getjobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getjobInfoIdtag(id));
  return db.query.jobInfoTable.findFirst({
    where: and(eq(jobInfoTable.id, id), eq(jobInfoTable.userId, userId)),
  });
}
