import { env } from "@/data/env/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
})