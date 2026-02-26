import { BackLink } from "@/components/BackLink";
import { MarkdownRender } from "@/components/MarkdownRender";
import { Skeleton, SkeletonButton } from "@/components/Skeleton";
import { SuspensedItem } from "@/components/SuspenseItem";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { GenerateInterviewFeedback } from "@/features/interviews/action";
import { getInterviewIdTag } from "@/features/interviews/dbCache";
import { getjobInfoIdtag } from "@/features/jobInfos/dbcache";
import { formatDateTime } from "@/lib/formatters";
import { getcurrentUser } from "@/lib/getCurrentUser";
import { ConversationMessages } from "@/services/hume/components/ConversationMessages";
import { fetchChatMessages } from "@/services/hume/lib/api";
import { CondenseChatMessages } from "@/services/hume/lib/CondenseChatMessages";
import { eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string; interviewId: string }>;
}) {
  const { jobInfoId, interviewId } = await params;

  const interview = getcurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();
      const interview = await getinterview(interviewId, userId);
      if (interview == null) return notFound();

      return interview;
    },
  );

  return (
    <div className="conatiner my-4 space-y-5">
      <BackLink href={`/app/job-infos/${jobInfoId}/interviews`}>
        All Interviews
      </BackLink>

      <div className="space-y-6">
        <div className="flex gap-2 justify-between ">
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl md:text-4xl">
              Interview:{" "}
              <SuspensedItem
                item={interview}
                fallback={<Skeleton className="w-48" />}
                result={(i) => formatDateTime(i.createdAt)}
              />
            </h1>
            <p className="text-muted-foreground  text-lg ">
              <SuspensedItem
                item={interview}
                fallback={<Skeleton className="w-24" />}
                result={(i) => i.duration}
              />
            </p>
          </div>
          <SuspensedItem
            item={interview}
            fallback={<SkeletonButton className="w-32" />}
            result={(i) =>
              i.feedback == null ? (
                <ActionButton
                  action={GenerateInterviewFeedback.bind(null, i.id)}
                >
                  Generate Feedback
                </ActionButton>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>View Feedback</Button>
                  </DialogTrigger>

                  <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)] overflow-y-auto flex flex-col">
                    <DialogTitle>Feedback</DialogTitle>

                    <MarkdownRender>{i.feedback}</MarkdownRender>
                  </DialogContent>
                </Dialog>
              )
            }
          />
        </div>

        <Suspense
          fallback={<Loader2Icon className="animate-spin size-24 mx-auto" />}
        >
          <Messages interview={interview} />
        </Suspense>
      </div>
    </div>
  );
}

async function Messages({
  interview,
}: {
  interview: Promise<{ humechat: string | null }>;
}) {
  const { user, redirectToSignIn } = await getcurrentUser({ allData: true });
  if (user == null) return redirectToSignIn();
  const { humechat } = await interview;
  if (humechat == null) return notFound();

  const CondensedMessages = await CondenseChatMessages(
    await fetchChatMessages(humechat),
  );

  return (
    <ConversationMessages
      messages={CondensedMessages}
      user={user}
      className="max-w-5xl mx-auto"
    />
  );
}

async function getinterview(id: string, userId: string) {
  "use cache";
  cacheTag(getInterviewIdTag(id));
  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
        },
      },
    },
  });
  if (interview == null) return null;
  cacheTag(getjobInfoIdtag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
}
