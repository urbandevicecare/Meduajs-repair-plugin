import { Migration } from '@mikro-orm/migrations';

export class Migration20261002000001 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "repair_settings" add column if not exists "zoho_domain" text not null default \'com\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "repair_settings" drop column if exists "zoho_domain";');
  }
}
