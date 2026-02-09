import { UserAvatar } from "@/features/user/UserAvatar";
import { cn } from "@/lib/utils";
import { BrainCircuitIcon } from "lucide-react";

export function ConversationMessages({
  messages,
  user,
  className,
  maxfft = 0,
}: {
  messages: { isUser: boolean; content: string[] }[];
  user: { name: string; imageUrl: string };
  className?: string;
  maxfft?: number;
}) {
  return (
    <div className={cn("flex flex-col w-full gap-4 ", className)}>
      {messages.map((message, index) => {
        const shouldAnimate = index === messages.length - 1 && maxfft > 0;
        return (
          <div
            key={index}
            className={cn(
              "flex items-center rounded max-w-3/4  border  pl-4 pr-6 py-4 ",
              message.isUser ? "self-end" : "self-start",
            )}
          >
            {message.isUser ? (
              <UserAvatar user={user} className="size-6 shrink-0" />
            ) : (
              <div className="relative">
                <div
                  className={cn(
                    "absolute inset-0 border-muted  rounded-full border-4",
                    shouldAnimate ? "animate-ping" : "hidden",
                  )}
                />
                <BrainCircuitIcon
                  className="size-6 shrink-0 relative"
                  style={shouldAnimate ? { scale: maxfft / 8 + 1 } : undefined}
                />
              </div>
            )}

            <div className="flex flex-col gap-1 ">
              <div className="flex flex-col gap-1">
                {message.content.map((text, i) => (
                  <span key={i}>{text}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
