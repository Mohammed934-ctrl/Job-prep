"use client";
import { Button } from "@/components/ui/button";
import { jobInfoTable } from "@/drizzle/schema";
import { createInterview, updateInteview } from "@/features/interviews/action";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useMemo } from "react";
import { errorToast } from "@/lib/errorToast";

import { env } from "@/data/env/client";
import { Loader2Icon, MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react";

import { CondenseChatMessages } from "@/services/hume/lib/CondenseChatMessages";
import { ConversationMessages } from "@/services/hume/components/ConversationMessages";
import { validateEmail } from "@arcjet/next";

export default function StartCall({
  jobInfo,
  user,
  accessToken,
}: {
  accessToken: string;
  jobInfo: Pick<
    typeof jobInfoTable.$inferSelect,
    "id" | "title" | "description" | "experiencelevel"
  >;
  user: { name: string; imageUrl: string };
}) {
  const { connect, readyState, chatMetadata, callDurationTimestamp } =
    useVoice();
  const [interviewId, setinterviewId] = useState<string | null>(null);
  const durationRef = useRef(callDurationTimestamp);
  const router = useRouter();
  durationRef.current = callDurationTimestamp;

  //this for chatId and interviewId
  useEffect(() => {
    if (chatMetadata?.chatId == null || interviewId == null) {
      return;
    }

    updateInteview(interviewId, { humechat: chatMetadata?.chatId });
  }, [chatMetadata?.chatId, interviewId]);

  //this is for duration
  useEffect(() => {
    if (interviewId == null) return;
    const intervalId = setInterval(() => {
      if (durationRef.current == null) return;
      updateInteview(interviewId, {
        duration: durationRef.current,
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [interviewId]);

  //handle disconnect
  useEffect(() => {
    //here we only run this when  ready state value is closed
    if (readyState !== VoiceReadyState.CLOSED) return;

    if (interviewId == null) {
      router.push(`/app/job-infos/${jobInfo.id}/interviews`);
      return;
    }

    if (durationRef.current != null) {
      updateInteview(interviewId, {
        duration: durationRef.current,
      });
    }

    router.push(`/app/job-infos/${jobInfo.id}/interviews/${interviewId}`);
  }, [readyState, interviewId, router, jobInfo.id]);

  if (readyState === VoiceReadyState.IDLE) {
    return (
      <div className="flex justify-center items-center  h-screen  ">
        <Button
          size="lg"
          className="px-20 py-10 text-4xl font-bold rounded"
          onClick={async () => {
            const res = await createInterview({ jobinfoid: jobInfo.id });
            if (res.error) {
              return errorToast(res.message);
            }

            setinterviewId(res.id);
            connect({
              auth: { type: "accessToken", value: accessToken },
              configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
              sessionSettings: {
                type: "session_settings",
                variables: {
                  userName: user.name,
                  title: jobInfo.title || "Not Specified",
                  description: jobInfo.description,
                  experienceLevel: jobInfo.experiencelevel,
                },
              },
            });
          }}
        >
          Start Interview
        </Button>
      </div>
    );
  }
  if (
    readyState === VoiceReadyState.CONNECTING ||
    readyState === VoiceReadyState.CLOSED
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon className="animate-spin size-25" />
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse overflow-y-auto h-screen">
      <div className="container py-6 flex flex-col items-center justify-end gap-4">
        <Messages user={user} />
        <Controls/>
      </div>
    </div>
  );
}

function Messages({ user }: { user: { name: string; imageUrl: string } }) {
  const { messages, fft } = useVoice();

  const CondenseMessage = useMemo(() => {
    return CondenseChatMessages(messages);
  }, [messages]);

  return (
    <ConversationMessages
      messages={CondenseMessage}
      user={user}
      maxfft={Math.max(...fft)}
      className="max-w-5xl"
    />
  );
}

function Controls() {
  const { disconnect, mute, unmute, isMuted, micFft, callDurationTimestamp } =
    useVoice();

  return (
    <div className="flex bottom-6 sticky gap-5 rounded border items-center px-5 py-2  w-fit bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3"
        onClick={() => (isMuted ? unmute() : mute())}
      >
        {isMuted ? <MicOffIcon className="text-destructive" /> : <MicIcon />}
        <span className="sr-only"> {isMuted ? "Unmute" : "Mute"}</span>
      </Button>
      <div className="self-stretch">
        <FftVisualizer fft={micFft} />
      </div>
      <div className="text-sm tabular-nums text-muted-foreground">
        {callDurationTimestamp}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="-mx-3"
        onClick={disconnect}
      >
        <PhoneOffIcon className="text-destructive" />
        <span className="sr-only">End Call</span>
      </Button>
    </div>
  );
}

function FftVisualizer({ fft }: { fft: number[] }) {
  return (
    <div className="flex items-center gap-1 h-full">
      {fft.map((value, index) => {
        const percentage = (value / 4) * 100;
        return (
          <div
            key={index}
            className="max-h-0.5 w-0.5 bg-primary/75 rounded"
            style={{ height: `${percentage < 0 ? 0 : percentage}%` }}
          ></div>
        );
      })}
    </div>
  );
}
