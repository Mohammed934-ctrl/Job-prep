import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateUsercache } from "./dbcache";

export const UpserUser = async (user: typeof UserTable.$inferInsert) => {
  await db
    .insert(UserTable)
    .values(user)
    .onConflictDoUpdate({
      target: [UserTable.id],
      set: user,
    });

  revalidateUsercache(user.id); 
};

export const DeleteUser = async (id: string) => {
  await db.delete(UserTable).where(eq(UserTable.id, id));
  revalidateUsercache(id);
};
