"use client"
import { jobInfoTable } from "@/drizzle/schema"
import { useVoice } from "@humeai/voice-react"
import { useState } from "react"









export default function StartCall( {jobInfo,user,accessToken}:{accessToken:string
    jobInfo: Pick<
    typeof jobInfoTable.$inferSelect,
     "id" |"title" | "description" | "experiencelevel" 
  >
    user:{name:string,imageUrl:string}
}){
    const {connect,readyState,chatMetadata,callDurationTimestamp} = useVoice()
    const[interviewId,setinterviewId] = useState<string | null>(null)
    




    return (
        <div>
        </div>
    )
}