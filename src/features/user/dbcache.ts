import { getGlobaltag, getIdtag } from "@/lib/datacache";
import { revalidateTag } from "next/cache";

export function getUserGlobaltag(){
  return getGlobaltag("user");
}


export function getUserbyIdtag(Id:string){
    return getIdtag("user",Id)
}


export function revalidateUsercache(id:string) {
    revalidateTag(getUserbyIdtag(id),"max");
     revalidateTag(getUserGlobaltag(),"max")
}