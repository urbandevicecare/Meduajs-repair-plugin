"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260917000002 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260917000002 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_books_enabled" boolean not null default false;');
        this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_client_id" text;');
        this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_client_secret" text;');
        this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_refresh_token" text;');
        this.addSql('alter table if exists "repair_settings" add column if not exists "zoho_organization_id" text;');
    }
    async down() {
        this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_books_enabled";');
        this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_client_id";');
        this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_client_secret";');
        this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_refresh_token";');
        this.addSql('alter table if exists "repair_settings" drop column if exists "zoho_organization_id";');
    }
}
exports.Migration20260917000002 = Migration20260917000002;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA5MTcwMDAwMDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDkxNzAwMDAwMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUVwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsdUhBQXVILENBQUMsQ0FBQztRQUNySSxJQUFJLENBQUMsTUFBTSxDQUFDLHlGQUF5RixDQUFDLENBQUM7UUFDdkcsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2RkFBNkYsQ0FBQyxDQUFDO1FBQzNHLElBQUksQ0FBQyxNQUFNLENBQUMsNkZBQTZGLENBQUMsQ0FBQztRQUMzRyxJQUFJLENBQUMsTUFBTSxDQUFDLCtGQUErRixDQUFDLENBQUM7SUFDL0csQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxRkFBcUYsQ0FBQyxDQUFDO1FBQ25HLElBQUksQ0FBQyxNQUFNLENBQUMsaUZBQWlGLENBQUMsQ0FBQztRQUMvRixJQUFJLENBQUMsTUFBTSxDQUFDLHFGQUFxRixDQUFDLENBQUM7UUFDbkcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxRkFBcUYsQ0FBQyxDQUFDO1FBQ25HLElBQUksQ0FBQyxNQUFNLENBQUMsdUZBQXVGLENBQUMsQ0FBQztJQUN2RyxDQUFDO0NBRUY7QUFsQkQsMERBa0JDIn0=