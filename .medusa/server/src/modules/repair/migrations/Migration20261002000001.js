"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20261002000001 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20261002000001 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "repair_settings" add column if not exists "zoho_domain" text not null default \'com\';');
    }
    async down() {
        this.addSql('alter table "repair_settings" drop column if exists "zoho_domain";');
    }
}
exports.Migration20261002000001 = Migration20261002000001;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjEwMDIwMDAwMDEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MTAwMjAwMDAwMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMscUdBQXFHLENBQUMsQ0FBQztJQUNySCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLG9FQUFvRSxDQUFDLENBQUM7SUFDcEYsQ0FBQztDQUNGO0FBUkQsMERBUUMifQ==