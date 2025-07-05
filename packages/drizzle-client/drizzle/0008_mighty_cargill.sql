ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-07-05 12:25:52.048';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-07-05 12:25:52.048';--> statement-breakpoint
ALTER TABLE "upgrade"."session" ADD COLUMN "session_id" uuid DEFAULT gen_random_uuid();