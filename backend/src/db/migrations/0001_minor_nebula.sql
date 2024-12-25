CREATE TYPE "public"."permission" AS ENUM('owner', 'admin', 'editor', 'viewer');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "board_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"board_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"permission" "permission" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_board_member" UNIQUE("board_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_permissions" ADD CONSTRAINT "board_permissions_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_permissions" ADD CONSTRAINT "board_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_members_user_idx" ON "board_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_members_board_idx" ON "board_permissions" USING btree ("board_id");