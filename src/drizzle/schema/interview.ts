import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelper";
import { jobInfoTable } from "./jobInfo";
import { relations } from "drizzle-orm";

export const InterviewTable = pgTable("interviews", {
  id,
  jobInfoid: uuid()
    .references(() => jobInfoTable.id, { onDelete: "cascade" })
    .notNull(),
  duration: varchar().notNull(),
  humechat: varchar(),
  feedback: varchar(),
  createdAt,
  updatedAt,
});

export const InterviewTableRelation = relations(
  InterviewTable,
  ({ one }) => ({
    jobInfo: one(jobInfoTable, {
      fields: [InterviewTable.jobInfoid],
      references: [jobInfoTable.id],
    }),
  })
);
