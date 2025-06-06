CREATE TABLE "upgrade"."plans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."plans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"details" varchar NOT NULL,
	"amount" integer NOT NULL,
	"razorpay_plan_id" varchar(255) DEFAULT '' NOT NULL,
	"streamer_id" integer NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_razorpayPlanId_unique" UNIQUE("razorpay_plan_id"),
	CONSTRAINT "plans_streamerId_unique" UNIQUE("streamer_id")
);
--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-06-06 18:41:06.790';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-06-06 18:41:06.790';--> statement-breakpoint
ALTER TABLE "upgrade"."plans" ADD CONSTRAINT "plans_streamer_id_users_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;