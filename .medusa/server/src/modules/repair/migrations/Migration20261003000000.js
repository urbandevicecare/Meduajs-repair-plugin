"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20261003000000 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20261003000000 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "repair_settings" add column if not exists "pdf_logo_url" text null;');
        this.addSql('alter table "repair_settings" add column if not exists "pdf_payment_details" text null;');
        this.addSql('alter table "repair_settings" add column if not exists "pdf_terms" text null;');
    }
    async down() {
        this.addSql('alter table "repair_settings" drop column if exists "pdf_logo_url";');
        this.addSql('alter table "repair_settings" drop column if exists "pdf_payment_details";');
        this.addSql('alter table "repair_settings" drop column if exists "pdf_terms";');
    }
}
exports.Migration20261003000000 = Migration20261003000000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjEwMDMwMDAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MTAwMzAwMDAwMC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsa0ZBQWtGLENBQUMsQ0FBQztRQUNoRyxJQUFJLENBQUMsTUFBTSxDQUFDLHlGQUF5RixDQUFDLENBQUM7UUFDdkcsSUFBSSxDQUFDLE1BQU0sQ0FBQywrRUFBK0UsQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMscUVBQXFFLENBQUMsQ0FBQztRQUNuRixJQUFJLENBQUMsTUFBTSxDQUFDLDRFQUE0RSxDQUFDLENBQUM7UUFDMUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7Q0FDRjtBQVpELDBEQVlDIn0=