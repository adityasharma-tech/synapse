ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-05-31 18:38:57.157';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-05-31 18:38:57.157';--> statement-breakpoint
ALTER TABLE "upgrade"."permissions" ALTER COLUMN "target_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "upgrade"."permissions" ALTER COLUMN "resource_id" SET NOT NULL;