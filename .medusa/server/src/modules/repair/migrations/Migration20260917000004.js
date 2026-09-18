"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260917000004 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260917000004 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "repair_settings" add column if not exists "company_name" text not null default \'Repair Shop\';');
        this.addSql('alter table if exists "repair_settings" add column if not exists "storefront_url" text;');
    }
    async down() {
        this.addSql('alter table if exists "repair_settings" drop column if exists "company_name";');
        this.addSql('alter table if exists "repair_settings" drop column if exists "storefront_url";');
    }
}
exports.Migration20260917000004 = Migration20260917000004;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA5MTcwMDAwMDQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDkxNzAwMDAwNC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUVwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsd0hBQXdILENBQUMsQ0FBQztRQUN0SSxJQUFJLENBQUMsTUFBTSxDQUFDLHlGQUF5RixDQUFDLENBQUM7SUFDekcsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQywrRUFBK0UsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxNQUFNLENBQUMsaUZBQWlGLENBQUMsQ0FBQztJQUNqRyxDQUFDO0NBRUY7QUFaRCwwREFZQyJ9