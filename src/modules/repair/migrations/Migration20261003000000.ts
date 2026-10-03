import { Migration } from '@mikro-orm/migrations';

export class Migration20261003000000 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "repair_settings" add column if not exists "pdf_logo_url" text null;');
    this.addSql('alter table "repair_settings" add column if not exists "pdf_payment_details" text null;');
    this.addSql('alter table "repair_settings" add column if not exists "pdf_terms" text null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "repair_settings" drop column if exists "pdf_logo_url";');
    this.addSql('alter table "repair_settings" drop column if exists "pdf_payment_details";');
    this.addSql('alter table "repair_settings" drop column if exists "pdf_terms";');
  }
}
