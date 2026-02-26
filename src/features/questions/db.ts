import { db } from "@/drizzle/db";
import { QuestionTable } from "@/drizzle/schema";
import { revalidateQuestionCache } from "./dbCache";

export async function insertQuestion({
  question,
}: {
  question: typeof QuestionTable.$inferInsert;
}) {
  const [newquestion] = await db
    .insert(QuestionTable)
    .values(question)
    .returning({
      id: QuestionTable.id,
      jobinfoId: QuestionTable.jobinfoid,
    });

  revalidateQuestionCache({
    id: newquestion.id,
    jobInfoId: newquestion.jobinfoId,
  });

  return newquestion;
}
