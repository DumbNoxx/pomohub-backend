ALTER TABLE "users" RENAME COLUMN "email" TO "email_github";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "username" TO "username_github";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_github_unique" UNIQUE("email_github");