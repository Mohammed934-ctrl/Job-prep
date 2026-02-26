import { auth } from "@clerk/nextjs/server";

 type Permission =
  | "3_interview"
  | "10_interview"
  | "5_question"
  | "unlimited_interview"
  | "unlimited_question"
  | "unlimited_resume_analysis";


export async function hasPermission(permission:Permission){
    const {has} = await auth()

    return has({feature:permission})



}