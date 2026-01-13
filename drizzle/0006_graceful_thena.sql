CREATE TYPE "public"."user_role" AS ENUM('admin', 'dev', 'user');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user';