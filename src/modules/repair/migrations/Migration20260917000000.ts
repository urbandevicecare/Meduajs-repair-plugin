import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260917000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "repair_ticket" add column if not exists "payment_status" text not null default 'pending';`,
    );
    this.addSql(
      `alter table if exists "repair_ticket" add column if not exists "payment_collection_id" text;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "repair_ticket" drop column if exists "payment_status";`,
    );
    this.addSql(
      `alter table if exists "repair_ticket" drop column if exists "payment_collection_id";`,
    );
  }
}
