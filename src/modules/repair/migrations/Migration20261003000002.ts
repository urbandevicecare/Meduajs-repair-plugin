import { Migration } from '@mikro-orm/migrations';

export class Migration20261003000002 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table if not exists "repair_link" ("id" text not null, "shortcode" text not null, "url" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "repair_link_pkey" primary key ("id"));');
    this.addSql('create unique index if not exists "IDX_repair_link_shortcode" on "repair_link" ("shortcode") where "deleted_at" is null;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "repair_link" cascade;');
  }
}
