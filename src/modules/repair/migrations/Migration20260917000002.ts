import { Migration } from '@mikro-orm/migrations';

export class Migration20260917000002 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_books_enabled" boolean not null default false;');
    this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_client_id" text;');
    this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_client_secret" text;');
    this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_refresh_token" text;');
    this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_organization_id" text;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_books_enabled";');
    this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_client_id";');
    this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_client_secret";');
    this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_refresh_token";');
    this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_organization_id";');
  }

}
