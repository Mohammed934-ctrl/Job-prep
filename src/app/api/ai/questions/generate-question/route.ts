  import { db } from "@/drizzle/db";
  import {
    jobInfoTable,
    Questiondifficultylevel,
    QuestionTable,
  } from "@/drizzle/schema";
  import { getjobInfoIdtag } from "@/features/jobInfos/dbcache";
  import { getquestionJobInfotag } from "@/features/questions/dbCache";
  import { canCreateQuestion } from "@/features/questions/permission";
  import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
  import { getcurrentUser } from "@/lib/getCurrentUser";
  import { and, asc, eq } from "drizzle-orm";
  import { cacheTag } from "next/cache";
  import z from "zod";
  import { GenerateAiQuestion } from "@/services/ai/question";
  import { insertQuestion } from "@/features/questions/db";
  import { createDataStreamResponse } from "ai";

  const schema = z.object({
    prompt: z.enum(Questiondifficultylevel),
    jobInfoId: z.string().min(1),
  });

  export async function POST(req: Request) {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return new Response("Error generating your question", { status: 400 });
    }

    const { prompt: difficulty, jobInfoId } = result.data;
    const { userId } = await getcurrentUser();

    if (userId == null) {
      return new Response("You are not logged in", { status: 401 });
    }

    if (!(await canCreateQuestion())) {
      return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
    }

    const jobInfo = await getjobInfo(jobInfoId, userId);
    if (jobInfo == null) {
      return new Response("You do not have permission to do this", {
        status: 403,
      });
    }

    const previousQuestions = await getQuestions(jobInfoId);

    
    return createDataStreamResponse({
      execute: async dataStream => {
        const res = GenerateAiQuestion({
          previousQuestions,
          jobInfo,
          difficulty,
          onFinish: async question => {
            const { id } = await insertQuestion({
              text: question,
              jobinfoid:jobInfoId,
              difficulty,
            })

            dataStream.writeData({ questionId: id })
          },
        })
        res.mergeIntoDataStream(dataStream, { sendUsage: false })
      },
    })
  }

  async function getQuestions(jobInfoId: string) {
    "use cache";
    cacheTag(getquestionJobInfotag(jobInfoId));

    return db.query.QuestionTable.findMany({
      where: eq(QuestionTable.jobinfoid, jobInfoId),
      orderBy: asc(QuestionTable.createdAt),
    });
  }

  async function getjobInfo(id: string, userId: string) {
    "use cache";
    cacheTag(getjobInfoIdtag(id));
    return db.query.jobInfoTable.findFirst({
      where: and(eq(jobInfoTable.id, id), eq(jobInfoTable.userId, userId)),
    });
  }
