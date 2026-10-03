import { Migration } from '@mikro-orm/migrations';

export class Migration20261003000001 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "repair_settings" add column if not exists "pdf_address" text null;');
    this.addSql('alter table "repair_settings" add column if not exists "pdf_phone" text null;');
    this.addSql('alter table "repair_settings" add column if not exists "pdf_email" text null;');
    this.addSql('alter table "repair_settings" add column if not exists "pdf_website" text null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "repair_settings" drop column if exists "pdf_address";');
    this.addSql('alter table "repair_settings" drop column if exists "pdf_phone";');
    this.addSql('alter table "repair_settings" drop column if exists "pdf_email";');
    this.addSql('alter table "repair_settings" drop column if exists "pdf_website";');
  }
}
