ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-06-16 09:54:15.088';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-06-16 09:54:15.088';--> statement-breakpoint
ALTER TABLE "upgrade"."emotes" ADD COLUMN "streamer_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "upgrade"."emotes" ADD CONSTRAINT "emotes_streamer_id_users_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "userIndex" ON "upgrade"."emotes" USING btree ("streamer_id");