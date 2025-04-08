CREATE TYPE "upgrade"."last_login_method" AS ENUM('email-password', 'sso/google', 'sso/github');--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-04-08 07:48:59.896';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-04-08 07:48:59.896';--> statement-breakpoint
ALTER TABLE "upgrade"."users" ADD COLUMN "last_login_method" "upgrade"."last_login_method" DEFAULT 'email-password';