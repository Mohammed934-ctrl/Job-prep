import { jobInfoTable } from "@/drizzle/schema"
import { generateText } from "ai"
import { google } from "../models/google"
import { aiAnalyzeSchema } from "./schemas"
import z from "zod"
import mammoth from "mammoth"
import WordExtractor from "word-extractor"

export async function analyzeResumeForJob({
  resumeFile,
  jobInfo,
}: {
  resumeFile: File
  jobInfo: Pick<
    typeof jobInfoTable.$inferSelect,
    "title" | "experiencelevel" | "description"
  >
}): Promise<z.infer<typeof aiAnalyzeSchema>> {
  const content: any[] = [];
  const buffer = await resumeFile.arrayBuffer();

  if (
    resumeFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
    resumeFile.name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    content.push({ type: "text", text: `Resume Content:\n${result.value}` });
  } else if (
    resumeFile.type === "application/msword" || 
    resumeFile.name.endsWith(".doc")
  ) {
    const extractor = new WordExtractor();
    const extracted = await extractor.extract(Buffer.from(buffer));
    content.push({ type: "text", text: `Resume Content:\n${extracted.getBody()}` });
  } else {
    content.push({
      type: "file",
      data: buffer,
      mimeType: resumeFile.type,
    });
  }

  content.push({
    type: "text",
    text: "Analyze this resume against the job requirements described in the system prompt. Return ONLY a raw JSON object — no markdown, no code fences, no extra text. Start your response with { and end with }.",
  });

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    messages: [
      {
        role: "user",
        content,
      },
    ],
    system: `You are an expert resume reviewer and hiring advisor.

The resume is being evaluated for this job:

Job Description:
\`\`\`
${jobInfo.description}
\`\`\`
Experience Level: ${jobInfo.experiencelevel}
${jobInfo.title ? `Job Title: ${jobInfo.title}` : ""}

Return ONLY a raw JSON object in exactly this structure (no markdown, no code blocks):

{
  "overallScore": <number 1-10>,
  "ats": {
    "score": <number 1-10>,
    "summary": "<string>",
    "feedback": [
      { "type": "strength" | "minor-improvement" | "major-improvement", "name": "<string>", "message": "<string>" }
    ]
  },
  "jobMatch": {
    "score": <number 1-10>,
    "summary": "<string>",
    "feedback": [
      { "type": "strength" | "minor-improvement" | "major-improvement", "name": "<string>", "message": "<string>" }
    ]
  },
  "writingAndFormatting": {
    "score": <number 1-10>,
    "summary": "<string>",
    "feedback": [
      { "type": "strength" | "minor-improvement" | "major-improvement", "name": "<string>", "message": "<string>" }
    ]
  },
  "keywordCoverage": {
    "score": <number 1-10>,
    "summary": "<string>",
    "feedback": [
      { "type": "strength" | "minor-improvement" | "major-improvement", "name": "<string>", "message": "<string>" }
    ]
  },
  "other": {
    "score": <number 1-10>,
    "summary": "<string>",
    "feedback": [
      { "type": "strength" | "minor-improvement" | "major-improvement", "name": "<string>", "message": "<string>" }
    ]
  }
}

Guidelines:
- Be specific, constructive, and actionable.
- Refer to the candidate as "you".
- Tailor all feedback to the job description and experience level.
`,
  })


  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim()

  const parsed = JSON.parse(cleaned)
  return aiAnalyzeSchema.parse(parsed)
}