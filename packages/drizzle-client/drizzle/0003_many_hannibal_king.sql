ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-06-06 06:04:44.581';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-06-06 06:04:44.581';--> statement-breakpoint
ALTER TABLE "upgrade"."chats" ADD COLUMN "reply_to_id" integer;