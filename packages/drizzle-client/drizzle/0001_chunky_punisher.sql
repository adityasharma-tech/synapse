CREATE TABLE "upgrade"."emotes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."emotes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"code" varchar(255) NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "emotes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-06-15 15:33:11.209';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-06-15 15:33:11.209';--> statement-breakpoint
CREATE UNIQUE INDEX "codeIndex" ON "upgrade"."emotes" USING btree ("code");