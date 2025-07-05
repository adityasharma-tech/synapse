ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-07-05 18:56:16.861';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-07-05 18:56:16.861';--> statement-breakpoint
ALTER TABLE "upgrade"."session" ADD COLUMN "os" varchar;--> statement-breakpoint
ALTER TABLE "upgrade"."session" DROP COLUMN "brands";--> statement-breakpoint
ALTER TABLE "upgrade"."session" DROP COLUMN "device_memory";