"use client";

import { BackLink } from "@/components/BackLink";
import { MarkdownRender } from "@/components/MarkdownRender";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  jobInfoTable,
  QuestionDifficulty,
  Questiondifficultylevel,
} from "@/drizzle/schema";
import { formatQuestionDifficulty } from "@/features/questions/formatter";
import { errorToast } from "@/lib/errorToast";
import { useCompletion } from "@ai-sdk/react";
import { GripVerticalIcon } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useMemo, useState } from "react";
import z from "zod";

type Status = "awaiting-answer" | "awaiting-difficulty" | "init";

export function QuestionClientPage({
  jobinfo,
}: {
  jobinfo: Pick<typeof jobInfoTable.$inferSelect, "id" | "name" | "title">;
}) {
  const [status, setstatus] = useState<Status>("init");
  const [answer, setAnswer] = useState<string | null>(null);

  const {
    complete: generateQuestion,
    completion: question,
    setCompletion: setQuestion,
    isLoading: isGeneratingQuestion,
    data,
  } = useCompletion({
    api: "/api/ai/questions/generate-question",
    onFinish: () => {
      setstatus("awaiting-answer");
    },
    onError: (error) => {
      errorToast(error.message);
    },
  });

  const {
    complete: generatefeedback,
    completion: feedback,
    setCompletion: setFeedback,
    isLoading: isGeneratingFeedback,
  } = useCompletion({
    api: "/api/ai/questions/generate-feedback",
    onFinish: () => {
      setstatus("awaiting-difficulty");
    },
    onError: (error) => {
      errorToast(error.message);
    },
  });

  const questionId = useMemo(() => {
    const item = data?.at(-1);
    if (item == null) return null;
    const parsed = z.object({ questionId: z.string() }).safeParse(item);
    if (!parsed.success) return null;
    return parsed.data.questionId;
  }, [data]);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <div className="shrink-0 flex justify-between items-center gap-4 px-4 py-3 border-b">
        <div className="grow basis-0">
          <BackLink href={`/app/job-infos/${jobinfo.id}`}>
            {jobinfo.name}
          </BackLink>
        </div>

        <Controls
          reset={() => {
            setAnswer(null);
            setQuestion("");
            setFeedback("");
            setstatus("init");
          }}
          disableAnswerButton={
            answer == null || answer?.trim() == "" || questionId == null
          }
          isLoading={isGeneratingFeedback || isGeneratingQuestion}
          status={status}
          generateFeedback={() => {
            if (answer == null || answer.trim() === "" || questionId == null)
              return;
            generatefeedback(answer.trim(), { body: { questionId } });
          }}
          generatequestion={(difficulty) => {
            setAnswer(null);
            setQuestion("");
            setFeedback("");
            generateQuestion(difficulty, { body: { jobInfoId: jobinfo.id } });
          }}
        />
        <div className="grow hidden md:block" />
      </div>

      <QuestionContainer
        question={question}
        answer={answer ?? ""}
        feedback={feedback}
        status={status}
        setAnswer={setAnswer}
      />
    </div>
  );
}

function QuestionContainer({
  question,
  answer,
  setAnswer,
  status,
  feedback,
}: {
  question: string;
  answer: string;
  status: Status;
  feedback: string;
  setAnswer: (value: string) => void;
}) {
  return (
    <PanelGroup direction="horizontal" className="flex-1 min-h-0 flex">
      <Panel defaultSize={55} minSize={20} className="h-full">
        <PanelGroup direction="vertical" className="h-full flex flex-col">
          <Panel
            defaultSize={feedback ? 25 : 100}
            minSize={10}
            className="h-full"
          >
            <ScrollArea className="h-full">
              {status === "init" && question === "" ? (
                <p className="text-base md:text-lg flex items-center justify-center h-full p-6">
                  Get started by selecting a question difficulty above.
                </p>
              ) : (
                question && (
                  <MarkdownRender className="p-6">{question}</MarkdownRender>
                )
              )}
            </ScrollArea>
          </Panel>

          {feedback && (
            <>
              <PanelResizeHandle className="h-px bg-border relative flex items-center justify-center cursor-row-resize hover:bg-primary/50 transition-colors">
                <div className="bg-border border rounded-sm w-4 h-3 flex items-center justify-center rotate-90 z-10">
                  <GripVerticalIcon className="size-2.5" />
                </div>
              </PanelResizeHandle>
              <Panel defaultSize={75} minSize={10} className="h-full">
                <ScrollArea className="h-full">
                  <MarkdownRender className="p-6">{feedback}</MarkdownRender>
                </ScrollArea>
              </Panel>
            </>
          )}
        </PanelGroup>
      </Panel>

      <PanelResizeHandle className="w-px bg-border relative flex items-center justify-center cursor-col-resize hover:bg-primary/50 transition-colors">
        <div className="bg-border border rounded-sm w-3 h-4 flex items-center justify-center z-10">
          <GripVerticalIcon className="size-2.5" />
        </div>
      </PanelResizeHandle>

      <Panel defaultSize={45} minSize={20} className="h-full">
        <Textarea
          value={answer || ""}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={status !== "awaiting-answer"}
          placeholder="Type your answer here..."
          className="w-full h-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset text-base p-6"
        />
      </Panel>
    </PanelGroup>
  );
}

function Controls({
  status,
  isLoading,
  disableAnswerButton,
  generatequestion,
  generateFeedback,
  reset,
}: {
  status: Status;
  isLoading: boolean;
  disableAnswerButton: boolean;
  generatequestion: (difficulty: QuestionDifficulty) => void;
  generateFeedback: () => void;
  reset: () => void;
}) {
  return (
    <div className="flex gap-2">
      {status === "awaiting-answer" ? (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            disabled={isLoading}
          >
            <LoadingSwap isLoading={isLoading}>Skip</LoadingSwap>
          </Button>

          <Button
            onClick={generateFeedback}
            disabled={disableAnswerButton}
            size="sm"
          >
            <LoadingSwap isLoading={isLoading}>Answer</LoadingSwap>
          </Button>
        </>
      ) : (
        Questiondifficultylevel.map((difficulty) => (
          <Button
            key={difficulty}
            size="sm"
            disabled={isLoading}
            onClick={() => generatequestion(difficulty)}
          >
            <LoadingSwap isLoading={isLoading}>
              {formatQuestionDifficulty(difficulty)}
            </LoadingSwap>
          </Button>
        ))
      )}
    </div>
  );
}
