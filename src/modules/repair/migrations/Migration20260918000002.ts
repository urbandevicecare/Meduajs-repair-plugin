import { Migration } from "@mikro-orm/migrations";

export class Migration20260918000002 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table if exists "repair_ticket" add column if not exists "raw_amount_paid" jsonb;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "repair_ticket" drop column if exists "raw_amount_paid";');
  }
}
