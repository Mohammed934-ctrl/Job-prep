type CacheTag = "user" | "jobInfo" | "interview" | "question";

export function getGlobaltag(tag: CacheTag) {
  return `global:${tag}` as const;
}

export function getUsertag(tag: CacheTag, userId: string) {
  return `user:${userId}:${tag}` as const;
}

export function getJobInfotag(tag: CacheTag, jobinfoId: string) {
  return `jobInfo:${jobinfoId}:${tag}` as const;
}
export function getIdtag(tag: CacheTag, id: string) {
  return `id:${id}:${tag}` as const;
}
