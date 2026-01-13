ALTER TABLE "users" ALTER COLUMN "email_github" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "github_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_google" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_google_unique" UNIQUE("email_google");