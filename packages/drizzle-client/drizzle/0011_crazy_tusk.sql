ALTER TABLE "upgrade"."session" RENAME COLUMN "location" TO "city";--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-07-05 18:21:34.452';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-07-05 18:21:34.452';--> statement-breakpoint
ALTER TABLE "upgrade"."session" ADD COLUMN "region" varchar;--> statement-breakpoint
ALTER TABLE "upgrade"."session" ADD COLUMN "timezone" varchar;--> statement-breakpoint
ALTER TABLE "upgrade"."session" ADD COLUMN "telecom" varchar;--> statement-breakpoint
ALTER TABLE "upgrade"."session" ADD COLUMN "country" varchar;