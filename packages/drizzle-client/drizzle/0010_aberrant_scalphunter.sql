ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-07-05 12:40:30.093';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-07-05 12:40:30.093';--> statement-breakpoint
ALTER TABLE "upgrade"."session" ALTER COLUMN "session_id" SET NOT NULL;