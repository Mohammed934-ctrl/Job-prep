import { Hume } from "hume";
import { ConnectionMessage } from "@humeai/voice-react"


type Message =
  | Hume.empathicVoice.JsonMessage //  Raw websocket JSON /
  | Hume.empathicVoice.ReturnChatEvent //Chat history event (user/AI transcript)//
  | ConnectionMessage
export function CondenseChatMessages(message: Message[]) {
  return message.reduce(
    (acc, message) => {
      const data = getChatEventData(message) ?? getJsonMessageData(message);
      if (!data?.content) return acc;

      const lastmessage = acc.at(-1);

      if (lastmessage == null) {
        acc.push({ isUser: !!data?.isUser, content: [data.content] });
        return acc;
      }

      if (lastmessage.isUser ===!! data.isUser) {
        lastmessage.content.push(data.content);
      } else {
        acc.push({ isUser: !!data.isUser, content: [data.content] });
      }

      return acc;
    },
    [] as { isUser: boolean; content: string[] }[],
  );
}

function getJsonMessageData(message: Message) {
  if (message.type != "user_message" && message.type != "assistant_message") {
    return null;
  }

  return {
    isUser: message.type === "user_message",
    content: message.message.content,
  };
}

function getChatEventData(message: Message) {
  if (message.type != "USER_MESSAGE" && message.type != "AGENT_MESSAGE") {
    return null;
  }

  return {
    isUser: message.type === "USER_MESSAGE",
    content: message.messageText,
  };
}
