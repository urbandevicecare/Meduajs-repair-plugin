import { Migration } from '@mikro-orm/migrations';

export class Migration20260917000003 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "repair_settings" add column if not exists "paystack_enabled" boolean not null default false;');
    this.addSql('alter table if exists "repair_settings" add column if not exists "paystack_public_key" text;');
    this.addSql('alter table if exists "repair_settings" add column if not exists "paystack_secret_key" text;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "repair_settings" drop column if exists "paystack_enabled";');
    this.addSql('alter table if exists "repair_settings" drop column if exists "paystack_public_key";');
    this.addSql('alter table if exists "repair_settings" drop column if exists "paystack_secret_key";');
  }

}
