CREATE TYPE "public"."priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('open', 'in-progress', 'closed');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('individual', 'government', 'enterprise');--> statement-breakpoint
CREATE TABLE "incident" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" varchar(20) NOT NULL,
	"user_id" integer NOT NULL,
	"reporter_email" varchar(255) NOT NULL,
	"reporter_name" varchar(255) NOT NULL,
	"reporter_type" "type" DEFAULT 'individual' NOT NULL,
	"details" text NOT NULL,
	"priority" "priority" DEFAULT 'low' NOT NULL,
	"status" "status" DEFAULT 'open' NOT NULL,
	"date_reported" timestamp DEFAULT now(),
	"is_editable" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "incident_incident_id_unique" UNIQUE("incident_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "type" DEFAULT 'individual' NOT NULL,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"country" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"mobile" varchar(20) NOT NULL,
	"fax" varchar(20),
	"phone" varchar(20),
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "incident" ADD CONSTRAINT "incident_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;