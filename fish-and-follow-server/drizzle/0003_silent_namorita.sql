ALTER TABLE "role" RENAME COLUMN "role_type" TO "role";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "role";