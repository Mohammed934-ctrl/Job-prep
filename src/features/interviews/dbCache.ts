import { getIdtag } from "@/lib/datacache";
import { revalidateTag } from "next/cache";
import { getjobInfoGlobaltag, getjobInfoIdtag } from "../jobInfos/dbcache";

export function getInterviewGlobalTag() {
  return getjobInfoGlobaltag();
}

export function getInterviewJobInfoTag(jobInfoId: string) {
  return getjobInfoIdtag(jobInfoId);
}

export function getInterviewIdTag(id: string) {
  return getIdtag("interview", id);
}

export function revalidateInterviewCache({
  id,
  jobInfoId,
}: {
  id: string;
  jobInfoId: string;
}) {
  revalidateTag(getInterviewGlobalTag(), "max");
  revalidateTag(getInterviewJobInfoTag(jobInfoId), "max");
  revalidateTag(getInterviewIdTag(id), "max");
}
