import { pgEnum, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelper";
import { UserTable } from "./user";
import { relations } from "drizzle-orm";

export const experiencelevels = ["Fresher", "Mid-level", "Senior"] as const;

export type ExperienceLevel = (typeof experiencelevels)[number];

export const experiencelevelenum = pgEnum(
  "experiencelevelenum",
  experiencelevels
);

export const jobInfoTable = pgTable("job_info", {
  id,
  title: varchar(),
  name: varchar().notNull(),
  experiencelevel: experiencelevelenum().notNull(),
  userId: varchar()
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  description: varchar().notNull(),
  createdAt,
  updatedAt,
});

export const JobInfoRelations = relations(jobInfoTable, ({ one }) => ({
  //user is the relation name
  user: one(UserTable, {
    fields: [jobInfoTable.userId],//this the foreign key in jobInfoTable
    references: [UserTable.id],//this is the primary key in UserTable
  }),
}));
