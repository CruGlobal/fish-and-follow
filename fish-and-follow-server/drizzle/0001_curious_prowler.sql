ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role_enum";--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('admin', 'staff');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."role_enum" USING "role"::"public"."role_enum";--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "notes" varchar(2500) DEFAULT '';