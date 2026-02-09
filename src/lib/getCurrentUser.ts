import { db } from "@/drizzle/db";

import { UserTable } from "@/drizzle/schema";

// Generates a cache tag for a specific userId
// Used to invalidate cache when user is created/updated (via webhook)
import { getUserbyIdtag } from "@/features/user/dbcache";

// Clerk server-side auth helper
import { auth } from "@clerk/nextjs/server";

// Next.js cache tagging API
import { cacheTag } from "next/cache";

// Drizzle SQL condition helper
import { eq } from "drizzle-orm";

/**
 * getcurrentUser
 * --------------------------------------------------
 * Central helper to:
 * 1. Get authenticated Clerk user
 * 2. Optionally fetch the user from our database
 *
 * */
 
export async function getcurrentUser({ allData = false } = {}) {
  // Get auth info from Clerk 
  const { userId, redirectToSignIn } = await auth();

  return {
    // Clerk userId (null if not logged in)
    userId,

    // Helper to redirect unauthenticated users
    redirectToSignIn,

    /**
     * Fetch DB user ONLY when:
     * - allData === true
     * - userId exists (user is logged in)
     *
     * Otherwise:
     * - skip DB call completely
     * - return undefined
     */
    user: allData && userId != null ? await getUser(userId) : undefined,
  };
}

/**
 * getUser
 * --------------------------------------------------
 * Fetch a user from the database by userId.
 * Result is cached and tagged for revalidation.
 */
async function getUser(id: string){
    // Tell Next.js to cache this function's result
  "use cache";

  /**
   * Attach a cache tag specific to this user.
   * Example: "user:user_123"
   *
   * When a webhook creates/updates this user,
   * we can call:
   *   revalidateTag(getUserbyIdtag(id))
   * to refresh cached data instantly.
   */
  cacheTag(getUserbyIdtag(id));

  // Query the database for the user
  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });
}
