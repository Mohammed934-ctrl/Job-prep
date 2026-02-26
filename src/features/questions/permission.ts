import { db } from "@/drizzle/db";
import { jobInfoTable, QuestionTable } from "@/drizzle/schema";
import { getcurrentUser } from "@/lib/getCurrentUser";
import { hasPermission } from "@/services/clerk/lib/haspermission";
import { count, eq } from "drizzle-orm";

export async function canCreateQuestion() {
  return Promise.any([
    hasPermission("unlimited_question").then((bool) => {
      if (bool) return true;
      return Promise.reject();
    }),

    Promise.all([hasPermission("5_question"), getUserQuestionCount()]).then(
      ([has, c]) => {
        if (has && c < 5) return true;
        return Promise.reject();
      },
    ),
  ]).catch(() => false);
}

async function getUserQuestionCount() {
  const { userId } = await getcurrentUser();

  if (userId == null) return 0;
  return getQuestionCount(userId);
}

async function getQuestionCount(userId: string) {
  const [{ count: c }] = await db
    .select({ count: count() })
    .from(QuestionTable)
    .innerJoin(jobInfoTable, eq(QuestionTable.jobinfoid, jobInfoTable.id))
    .where(eq(jobInfoTable.userId, userId));

  return c;
}
