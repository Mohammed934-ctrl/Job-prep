  import { db } from "@/drizzle/db";
  import { QuestionTable } from "@/drizzle/schema";
  import { getjobInfoIdtag } from "@/features/jobInfos/dbcache";
  import { getQuestionIdtag } from "@/features/questions/dbCache";
  import { getcurrentUser } from "@/lib/getCurrentUser";
  import { GenearateAiQuestionFeedback } from "@/services/ai/question";
  import { eq } from "drizzle-orm";
  import { cacheTag } from "next/cache";
  import z from "zod";

  const schema = z.object({
    prompt: z.string().min(1),
    questionId: z.string().min(1),
  });

  export async function POST(req: Request) {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return new Response("Error generating your feedback", { status: 400 });
    }

    const { prompt: answer, questionId } = result.data;
    const { userId } = await getcurrentUser();

    if (userId == null) {
      return new Response("You are not logged in", { status: 401 });
    }

    const question = await getquestion(questionId, userId);
    if (question == null) {
      return new Response("You do not have permission to do this", {
        status: 403,
      });
    }

    const res = GenearateAiQuestionFeedback({
      question: question.text,
      answer,
    });

    return res.toDataStreamResponse({ sendUsage: false });
  }

  async function getquestion(id: string, userId: string) {
    "use cache";
    cacheTag(getQuestionIdtag(id));

    const question = await db.query.QuestionTable.findFirst({
      where: eq(QuestionTable.id, id),
      with: { jobInfo: { columns: { id: true, userId: true } } },
    });

    if (question == null) return null;
    cacheTag(getjobInfoIdtag(question.jobInfo.id));

    if (question.jobInfo.userId !== userId) return null;

    return question;
  }
