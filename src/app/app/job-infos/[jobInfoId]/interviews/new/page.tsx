import { env } from "@/data/env/server";
import { db } from "@/drizzle/db";
import { jobInfoTable } from "@/drizzle/schema";
import { getjobInfoIdtag } from "@/features/jobInfos/dbcache";
import { getcurrentUser } from "@/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { fetchAccessToken } from "hume"
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { VoiceProvider } from "@humeai/voice-react"
import StartCall from "./StartCall";

export default async function NewInterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen-header">
          <Loader2Icon className="animate-spin size-24" />
        </div>
      }
    >
      <SuspensedComponent jobInfoId={jobInfoId} />
    </Suspense>
  );
}

async function SuspensedComponent({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn, user } = await getcurrentUser({
    allData: true,
  });

  if (userId == null || user == null) return redirectToSignIn();

  //Todo here will do it later
  const jobInfo = await getjobInfo(jobInfoId, userId);
  if(jobInfo==null) return notFound()



    const accessToken= await fetchAccessToken({
        apiKey:env.HUME_API_KEY,
        secretKey:env.HUME_SECRET_KEY
    })
  return (
     <VoiceProvider> 
         <StartCall  jobInfo={jobInfo} user={user}  accessToken={accessToken}/>
     </VoiceProvider>
  )
}

async function getjobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getjobInfoIdtag(id));

  return db.query.jobInfoTable.findFirst({
    where: and(eq(jobInfoTable.id, id), eq(jobInfoTable.userId, userId)),
  });
}
