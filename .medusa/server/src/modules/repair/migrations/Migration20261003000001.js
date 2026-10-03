"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20261003000001 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20261003000001 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "repair_settings" add column if not exists "pdf_address" text null;');
        this.addSql('alter table "repair_settings" add column if not exists "pdf_phone" text null;');
        this.addSql('alter table "repair_settings" add column if not exists "pdf_email" text null;');
        this.addSql('alter table "repair_settings" add column if not exists "pdf_website" text null;');
    }
    async down() {
        this.addSql('alter table "repair_settings" drop column if exists "pdf_address";');
        this.addSql('alter table "repair_settings" drop column if exists "pdf_phone";');
        this.addSql('alter table "repair_settings" drop column if exists "pdf_email";');
        this.addSql('alter table "repair_settings" drop column if exists "pdf_website";');
    }
}
exports.Migration20261003000001 = Migration20261003000001;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjEwMDMwMDAwMDEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MTAwMzAwMDAwMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsaUZBQWlGLENBQUMsQ0FBQztRQUMvRixJQUFJLENBQUMsTUFBTSxDQUFDLCtFQUErRSxDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLE1BQU0sQ0FBQywrRUFBK0UsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxNQUFNLENBQUMsaUZBQWlGLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLG9FQUFvRSxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxNQUFNLENBQUMsa0VBQWtFLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsTUFBTSxDQUFDLG9FQUFvRSxDQUFDLENBQUM7SUFDcEYsQ0FBQztDQUNGO0FBZEQsMERBY0MifQ==