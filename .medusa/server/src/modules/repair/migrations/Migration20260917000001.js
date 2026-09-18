"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260917000001 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260917000001 extends migrations_1.Migration {
    async up() {
        this.addSql('create table if not exists "repair_settings" ("id" text not null, "email_notifications_enabled" boolean not null default true, "sms_notifications_enabled" boolean not null default true, "whatsapp_notifications_enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "repair_settings_pkey" primary key ("id"));');
    }
    async down() {
        this.addSql('drop table if exists "repair_settings" cascade;');
    }
}
exports.Migration20260917000001 = Migration20260917000001;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA5MTcwMDAwMDEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDkxNzAwMDAwMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsbWJBQW1iLENBQUMsQ0FBQztJQUNuYyxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDakUsQ0FBQztDQUNGO0FBUkQsMERBUUMifQ==