CREATE TYPE "upgrade"."auth_method" AS ENUM('email-password', 'sso/google', 'sso/github');--> statement-breakpoint
CREATE TABLE "upgrade"."session" (
	"user_id" integer NOT NULL,
	"auth_method" "upgrade"."auth_method" DEFAULT 'email-password' NOT NULL,
	"last_active" timestamp DEFAULT now() NOT NULL,
	"invalid" boolean DEFAULT false NOT NULL,
	"token" varchar(255) NOT NULL,
	"user_agent" varchar(255) NOT NULL,
	"ip_address" varchar(255),
	"platform" varchar(255),
	"languages" varchar(255)[] DEFAULT '{}' NOT NULL,
	"mobile" boolean DEFAULT false,
	"brands" jsonb,
	"device_memory" integer,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "upgrade"."session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_index" ON "upgrade"."session" USING btree ("token");