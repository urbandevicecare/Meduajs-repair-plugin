import { Migration } from '@mikro-orm/migrations';

export class Migration20260917000001 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table if not exists "repair_settings" ("id" text not null, "email_notifications_enabled" boolean not null default true, "sms_notifications_enabled" boolean not null default true, "whatsapp_notifications_enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "repair_settings_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "repair_settings" cascade;');
  }
}
