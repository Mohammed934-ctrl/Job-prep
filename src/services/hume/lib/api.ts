/*
What does this function do in simple words --> It fetches all chat messages from a Hume chat session and returns them as an array
 */

import { env } from "@/data/env/server";
import { HumeClient } from "hume";
import { Hume } from "hume";

type ReturnChatEvent = Hume.empathicVoice.ReturnChatEvent;

export async function fetchChatMessages(humeChatId: string) {
  "use cache";
  const client = new HumeClient({ apiKey: env.HUME_API_KEY });

  const allchatevents: ReturnChatEvent[] = [];

  const chateventsiterator = await client.empathicVoice.chats.listChatEvents(
    humeChatId,
    {
      pageNumber: 0,
      pageSize: 100,
    },
  );

  for await (const chatevent of chateventsiterator) {
    allchatevents.push(chatevent);
  }

  return allchatevents;
}
