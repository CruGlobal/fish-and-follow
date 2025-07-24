ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "user_id";