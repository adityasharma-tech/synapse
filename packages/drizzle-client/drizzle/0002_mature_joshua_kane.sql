ALTER TABLE "upgrade"."streams" RENAME COLUMN "youtube_video_url" TO "video_url";--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-06-05 15:39:25.063';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-06-05 15:39:25.063';--> statement-breakpoint
ALTER TABLE "upgrade"."streams" ADD COLUMN "chat_slow_mode" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "upgrade"."streams" ADD COLUMN "about" varchar DEFAULT '';--> statement-breakpoint
ALTER TABLE "upgrade"."streams" ADD COLUMN "thumbnail_url" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "upgrade"."streams" DROP COLUMN "streaming_token";