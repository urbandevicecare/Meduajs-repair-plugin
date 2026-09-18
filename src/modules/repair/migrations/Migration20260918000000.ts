import { Migration } from "@mikro-orm/migrations";

export class Migration20260918000000 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table if exists "repair_ticket" add column if not exists "amount_paid" numeric not null default 0;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "repair_ticket" drop column if exists "amount_paid";');
  }
}
