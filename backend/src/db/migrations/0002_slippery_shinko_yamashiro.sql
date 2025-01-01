ALTER TABLE "boards" RENAME COLUMN "user_id" TO "creator_id";--> statement-breakpoint
ALTER TABLE "boards" DROP CONSTRAINT "unique_board_name_per_user";--> statement-breakpoint
ALTER TABLE "boards" DROP CONSTRAINT "boards_user_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "boards" ADD CONSTRAINT "boards_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "unique_board_name_per_user" UNIQUE("name","creator_id");