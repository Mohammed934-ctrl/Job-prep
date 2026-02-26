import { getGlobaltag, getIdtag, getJobInfotag } from "@/lib/datacache";

import { revalidateTag } from "next/cache";

export function getQuestionGlobaltag() {
  return getGlobaltag("question");
}

export function getquestionJobInfotag(jobInfoId: string) {
  return getJobInfotag("question", jobInfoId);
}

export function getQuestionIdtag(id: string) {
  return getIdtag("question", id);
}

export function revalidateQuestionCache({
  id,
  jobInfoId,
}: {
  id: string;
  jobInfoId: string;
}) {
  revalidateTag(getQuestionGlobaltag(), "max");
  revalidateTag(getquestionJobInfotag(jobInfoId), "max");
  revalidateTag(getQuestionIdtag(id), "max");
}
