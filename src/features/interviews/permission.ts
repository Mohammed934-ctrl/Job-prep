import { db } from "@/drizzle/db";
import { InterviewTable, jobInfoTable } from "@/drizzle/schema";
import { getcurrentUser } from "@/lib/getCurrentUser";
import { hasPermission } from "@/services/clerk/lib/haspermission";
import { and, count, eq, isNotNull } from "drizzle-orm";

export async function canCreateInterview() {
  return Promise.any([
    // If user has unlimited interviews permission → allow
    hasPermission("unlimited_interview").then((bool) => {
      if (bool) return true;
      return Promise.reject();
    }),

    // Pro plan → 10 interviews
    Promise.all([hasPermission("10_interview"), getUserInterviewCount()]).then(
      ([has, c]) => {
        if (has && c < 10) return true;
        return Promise.reject();
      },
    ),
    // free plan
    Promise.all([hasPermission("3_interview"), getUserInterviewCount()]).then(
      ([has, c]) => {
        if (has && c < 3) return true;
        return Promise.reject();
      },
    ),
  ]).catch(() => false);
}

async function getUserInterviewCount() {
  const { userId } = await getcurrentUser();
  if (userId == null) return 0;

  return getInterviewCount(userId);
}

// InterviewTable → interview data
// JobInfoTable → which user owns interview
// Join them → filter by user
// Count only completed interviews
async function getInterviewCount(userId: string) {
  const [{ count: c }] = await db
    .select({ count: count() })
    .from(InterviewTable)
    .innerJoin(jobInfoTable, eq(InterviewTable.jobinfoid, jobInfoTable.id))
    .where(
      and(eq(jobInfoTable.userId, userId), isNotNull(InterviewTable.humechat)),
    );

  return c;
}
