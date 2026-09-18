import { Migration } from "@mikro-orm/migrations";

export class Migration20260918000001 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table if exists "repair_ticket" add column if not exists "apply_tax" boolean not null default false;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "repair_ticket" drop column if exists "apply_tax";');
  }
}
