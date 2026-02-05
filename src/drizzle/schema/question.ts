import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelper";
import { jobInfoTable } from "./jobInfo";
import { relations } from "drizzle-orm";

export const Questiondifficultylevel = ["easy", "medium", "hard"] as const;

export type QuestionDifficulty = (typeof Questiondifficultylevel)[number]; //“this  line menas we want that readonly array and make them as union”

export const questiondifficultylevelenum = pgEnum(
  "questiondiffcultylevelenum",
  Questiondifficultylevel
);

export const QuestionTable = pgTable("questions", {
  id,
  jobInfoId: uuid()
    .references(() => jobInfoTable.id, { onDelete: "cascade" })
    .notNull(),
  text: varchar().notNull(),
  difficulty: questiondifficultylevelenum().notNull(),
  createdAt,
  updatedAt,
});

export const QuestionRelation = relations(QuestionTable, ({ one }) => ({
  jobInfo: one(jobInfoTable, {
    fields: [QuestionTable.jobInfoId],
    references: [jobInfoTable.id],
  }),
}));
