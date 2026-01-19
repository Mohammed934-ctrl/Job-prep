import { getGlobaltag, getIdtag, getUsertag } from "@/lib/datacache";
import { revalidateTag } from "next/cache";

export function getjobInfoGlobaltag() {
  return getGlobaltag("jobInfo");
}

export function getUserjobInfotag(userId: string) {
  return getUsertag("user", userId);
}

export function getjobInfoIdtag(id: string) {
  return getIdtag("jobInfo", id);
}

export function revalidateJobInfocache({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  revalidateTag(getjobInfoGlobaltag(), "max");
  revalidateTag(getUserjobInfotag(userId), "max");
  revalidateTag(getjobInfoIdtag(id), "max");
}
