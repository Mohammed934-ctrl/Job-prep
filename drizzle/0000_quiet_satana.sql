CREATE TYPE "public"."experiencelevelenum" AS ENUM('Fresher', 'Mid-level', 'Senior');--> statement-breakpoint
CREATE TYPE "public"."questiondiffcultylevelenum" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"imageUrl" varchar NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "job_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"name" varchar NOT NULL,
	"experiencelevel" "experiencelevelenum" NOT NULL,
	"userId" varchar NOT NULL,
	"description" varchar NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jobinfoid" uuid NOT NULL,
	"text" varchar NOT NULL,
	"difficulty" "questiondiffcultylevelenum" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jobinfoid" uuid NOT NULL,
	"duration" varchar NOT NULL,
	"humechat" varchar,
	"feedback" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_info" ADD CONSTRAINT "job_info_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_jobinfoid_job_info_id_fk" FOREIGN KEY ("jobinfoid") REFERENCES "public"."job_info"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_jobinfoid_job_info_id_fk" FOREIGN KEY ("jobinfoid") REFERENCES "public"."job_info"("id") ON DELETE cascade ON UPDATE no action;