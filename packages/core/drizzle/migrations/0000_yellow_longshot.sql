CREATE TABLE IF NOT EXISTS "recycle_bin_items" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"site_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"content_type" varchar(255) NOT NULL,
	"original_id" varchar(255) NOT NULL,
	"snapshot" jsonb NOT NULL,
	"metadata" jsonb,
	"status" varchar(50) DEFAULT 'deleted' NOT NULL,
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"restored_at" timestamp,
	"permanently_deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_idx" ON "recycle_bin_items" ("site_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_tenant_idx" ON "recycle_bin_items" ("site_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expires_idx" ON "recycle_bin_items" ("expires_at","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "original_idx" ON "recycle_bin_items" ("site_id","content_type","original_id");