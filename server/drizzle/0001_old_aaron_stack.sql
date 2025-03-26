CREATE TABLE "upgrade"."streamer_request" (
	"user_id" integer NOT NULL,
	"account_name" varchar NOT NULL,
	"account_email" varchar NOT NULL,
	"dashboard_access" varchar DEFAULT '0' NOT NULL,
	"customer_refunds" varchar DEFAULT '1' NOT NULL,
	"business_name" varchar NOT NULL,
	"business_type" "upgrade"."business_type" DEFAULT 'individual' NOT NULL,
	"request_status" "upgrade"."request_status" DEFAULT 'pending' NOT NULL,
	"bank_ifsc_code" varchar NOT NULL,
	"bank_account_number" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"street_address" varchar NOT NULL,
	"city" varchar NOT NULL,
	"state" varchar NOT NULL,
	"postal_code" varchar NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-03-26 11:39:35.417';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-03-26 11:39:35.417';--> statement-breakpoint
ALTER TABLE "upgrade"."streamer_request" ADD CONSTRAINT "streamer_request_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;