import { db } from "@/drizzle/db";
import { jobInfoTable } from "@/drizzle/schema";
import { revalidateJobInfocache } from "./dbcache";
import { eq } from "drizzle-orm";

export async function InsertjobInfo(jobInfo: typeof jobInfoTable.$inferInsert) {
  const [newjobinfo] = await db.insert(jobInfoTable).values(jobInfo).returning({
    id: jobInfoTable.id,
    userId: jobInfoTable.userId,
  });

  revalidateJobInfocache(newjobinfo);

  return newjobinfo;
}

export async function updatejobinfoDB(
  id: string,
  jobInfo: Partial<typeof jobInfoTable.$inferInsert>,
) {
  const [updatedjobInfo] = await db
    .update(jobInfoTable)
    .set(jobInfo)
    .where(eq(jobInfoTable.id, id))
    .returning({
      id: jobInfoTable.id,
      userId: jobInfoTable.userId,
    });

  revalidateJobInfocache(updatedjobInfo);

  return updatedjobInfo;
}
