"use server";

import z from "zod";
import { jobInfoschema } from "./schema";
import { getcurrentUser } from "@/services/lib/getCurrentUser";

import { InsertjobInfo, updatejobinfoDB } from "./db";
import { redirect } from "next/navigation";
import { cacheTag } from "next/cache";
import { getjobInfoIdtag } from "./dbcache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { jobInfoTable } from "@/drizzle/schema";

export async function createjobInfo(unsafeData: z.infer<typeof jobInfoschema>) {
  const { userId } = await getcurrentUser();

  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const { data, success } = jobInfoschema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    };
  }

  const jobInfo = await InsertjobInfo({ ...data, userId });

  redirect(`app/job-infos/${jobInfo.id}`);
}

export async function updatejobinfo(
  id: string,
  unsafeData: z.infer<typeof jobInfoschema>,
) {
  const { userId } = await getcurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const { data, success } = jobInfoschema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    };
  }

  const existingjobInfo = await getjobInfo(id, userId);
  if (existingjobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }
  const jobInfo = await updatejobinfoDB(id, data);

  redirect(`app/job-infos/${jobInfo.id}`);
}

async function getjobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getjobInfoIdtag(id));

  return await db.query.jobInfoTable.findFirst({
    where: and(eq(jobInfoTable.id, id), eq(jobInfoTable.userId, userId)),
  });
}
