CREATE TYPE "upgrade"."effects" AS ENUM('allow', 'disallow');--> statement-breakpoint
CREATE TYPE "upgrade"."resources" AS ENUM('stream', 'user', 'chat', 'order');--> statement-breakpoint
CREATE TABLE "upgrade"."permissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user" integer NOT NULL,
	"resource" "upgrade"."resources" NOT NULL,
	"effect" "upgrade"."effects" DEFAULT 'allow',
	"action" varchar(255) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_user_resource_effect_action_unique" UNIQUE("user","resource","effect","action")
);
--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-05-28 01:04:39.383';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-05-28 01:04:39.383';--> statement-breakpoint
ALTER TABLE "upgrade"."permissions" ADD CONSTRAINT "permissions_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;