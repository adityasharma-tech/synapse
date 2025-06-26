ALTER TYPE "upgrade"."paymentStatusEnum" RENAME TO "payment_status_enum";--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-06-26 14:27:57.916';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-06-26 14:27:57.916';