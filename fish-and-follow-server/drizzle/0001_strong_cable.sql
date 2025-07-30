ALTER TYPE "public"."gender_enum" ADD VALUE 'other';--> statement-breakpoint
ALTER TYPE "public"."gender_enum" ADD VALUE 'prefer_not_to_say';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role_enum";--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('admin', 'staff');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."role_enum" USING "role"::"public"."role_enum";--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "year" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."year_enum";--> statement-breakpoint
CREATE TYPE "public"."year_enum" AS ENUM('1', '2', '3', '4', '5', 'Master', 'PhD');--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "year" SET DATA TYPE "public"."year_enum" USING "year"::"public"."year_enum";