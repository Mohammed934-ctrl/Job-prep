"use client";

import { jobInfoTable } from "@/drizzle/schema";
import { errorToast } from "@/lib/errorToast";
import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";

type Status = "awaiting-answer" | "awaiting-difficulty" | "init";

export function QuestionClientPage({
  jobinfo,
}: {
  jobinfo: Pick<typeof jobInfoTable.$inferSelect, "id" | "name" | "title">;
}) {
  const [status, setstatus] = useState<Status>("init");
  const [answer, setanswer] = useState<string | null>(null);

  const {
    //Send a new prompt to the API endpoint and update the completion state
    complete: generateQuestion,
    // The current completion result
    completion: question,
    // Update the completion state locally
    setCompletion: setQuestion,
    isLoading: sGeneratingQuestion,
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
    complete:generatefeedback,
    completion:feedback,
    setCompletion:setFeedback,
    isLoading:isGeneratingFeedback

  } = useCompletion({
    api:"/api/ai/questions/generate-feedback",
    onFinish:()=>{
        setstatus("awaiting-difficulty")
    },
    onError:(error)=>{
        errorToast(error.message)

    }
  })


















  return <div>hello</div>;
}
