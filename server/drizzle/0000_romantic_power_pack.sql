CREATE SCHEMA "upgrade";
--> statement-breakpoint
CREATE TYPE "upgrade"."business_type" AS ENUM('llp', 'ngo', 'individual', 'partnership', 'proprietorship', 'public_limited', 'private_limited', 'trust', 'society', 'not_yet_registered', 'educational_institutes');--> statement-breakpoint
CREATE TYPE "upgrade"."request_status" AS ENUM('pending', 'processing', 'accepted', 'done');--> statement-breakpoint
CREATE TYPE "upgrade"."roles" AS ENUM('streamer', 'viewer', 'admin');--> statement-breakpoint
CREATE TABLE "upgrade"."chats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."chats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"stream_uid" varchar,
	"user_id" integer NOT NULL,
	"cf_order_id" varchar,
	"message" varchar NOT NULL,
	"mark_read" boolean DEFAULT false NOT NULL,
	"up_votes" integer[] DEFAULT '{}' NOT NULL,
	"down_votes" integer[] DEFAULT '{}' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"payment_status" varchar DEFAULT 'IDLE' NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upgrade"."orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"payment_session_id" varchar,
	"order_status" varchar DEFAULT 'PENDING' NOT NULL,
	"cf_order_id" varchar NOT NULL,
	"user_id" integer NOT NULL,
	"order_amount" integer NOT NULL,
	"order_currency" varchar(255) DEFAULT 'INR' NOT NULL,
	"order_expiry_time" varchar NOT NULL,
	"order_note" varchar,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upgrade"."payouts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."payouts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"transfer_id" varchar NOT NULL,
	"cf_transfer_id" varchar NOT NULL,
	"status" varchar NOT NULL,
	"status_code" varchar NOT NULL,
	"transfer_mode" varchar NOT NULL,
	"transfer_amount" varchar NOT NULL,
	"transfer_service_charge" varchar,
	"transfer_service_tax" varchar,
	"transfer_utr" varchar,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upgrade"."streams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."streams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"streaming_uid" varchar NOT NULL,
	"stream_title" varchar NOT NULL,
	"streaming_token" varchar NOT NULL,
	"streamer_id" integer NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "upgrade"."token_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."token_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"user_refresh_token" varchar,
	"streamer_verification_token" varchar,
	"reset_password_token" varchar,
	"reset_password_token_expiry" timestamp DEFAULT '2025-03-26 14:42:12.245',
	"email_verification_token" varchar,
	"email_verification_token_expiry" timestamp DEFAULT '2025-03-26 14:42:12.245',
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upgrade"."users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upgrade"."users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar NOT NULL,
	"profile_picture" varchar,
	"phone_number" varchar(45) NOT NULL,
	"password_hash" varchar NOT NULL,
	"role" "upgrade"."roles" DEFAULT 'viewer',
	"email_verified" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "upgrade"."chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade"."orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade"."payouts" ADD CONSTRAINT "payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade"."streams" ADD CONSTRAINT "streams_streamer_id_users_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade"."streamer_request" ADD CONSTRAINT "streamer_request_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ADD CONSTRAINT "token_table_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "upgrade"."users"("id") ON DELETE no action ON UPDATE no action;