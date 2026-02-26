import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: "Write a vegetarian lasagna recipe for 4 people.",
    });

      console.log(text)
    return NextResponse.json({ reply: text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message });
  }
}
