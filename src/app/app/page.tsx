import { db } from "@/drizzle/db";
import { jobInfoTable } from "@/drizzle/schema";
import { getUserjobInfotag } from "@/features/jobInfos/dbcache";
import { getcurrentUser } from "@/services/lib/getCurrentUser";
import { desc, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function Apppage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2Icon className="size-24 animate-spin" />
        </div>
      }
    >
      <JobInfos />
    </Suspense>
  );
}

async function JobInfos() {

   const { userId, redirectToSignIn}  =  await getcurrentUser()
   if(userId==null)
    return  redirectToSignIn()


  //  const jobInfos = await getjobInfos(userId)
  //   if(jobInfos.length ===0){
  //     return <NojobInfos/>
  //   }
   
  return <NojobInfos/>;
}






function NojobInfos (){
  return (
 <div className="container max-w-5xl my-4  ">
   <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-primary">Welcome to Job-Prep</h1>
     <p className="text-white mb-8">
        To get started, enter information about the type of job you are wanting
        to apply for. This can be specific information copied directly from a
        job listing or general information such as the tech stack you want to
        work in. The more specific you are in the description the closer the
        test interviews will be to the real thing.
      </p>

 </div>
  )
}






async function getjobInfos(userId:string) {

  "use cache"
  cacheTag(getUserjobInfotag(userId))
  return db.query.jobInfoTable.findMany({
    where:eq(jobInfoTable.id,userId),
    orderBy:desc(jobInfoTable.updatedAt)
  })

}
