import { Migration } from '@mikro-orm/migrations';

export class Migration20260917000004 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "repair_settings" add column if not exists "company_name" text not null default \'Repair Shop\';');
    this.addSql('alter table if exists "repair_settings" add column if not exists "storefront_url" text;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "repair_settings" drop column if exists "company_name";');
    this.addSql('alter table if exists "repair_settings" drop column if exists "storefront_url";');
  }

}
