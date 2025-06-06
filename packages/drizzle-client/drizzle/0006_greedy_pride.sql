CREATE TABLE "upgrade"."subscriptions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"plan_id" integer NOT NULL,
	"status" "upgrade"."subsStatusEnum" NOT NULL,
	"razorpay_subscription_id" varchar(255) NOT NULL,
	"payment_url" varchar NOT NULL,
	"user_id" integer NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_razorpaySubscriptionId_unique" UNIQUE("razorpay_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-06-06 18:47:34.224';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-06-06 18:47:34.224';--> statement-breakpoint
ALTER TABLE "upgrade"."subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "upgrade"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "planIdIndex" ON "upgrade"."subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "userIdIndex" ON "upgrade"."subscriptions" USING btree ("user_id");