"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260918000002 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260918000002 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "repair_ticket" add column if not exists "raw_amount_paid" jsonb;');
    }
    async down() {
        this.addSql('alter table if exists "repair_ticket" drop column if exists "raw_amount_paid";');
    }
}
exports.Migration20260918000002 = Migration20260918000002;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA5MTgwMDAwMDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDkxODAwMDAwMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMseUZBQXlGLENBQUMsQ0FBQztJQUN6RyxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLGdGQUFnRixDQUFDLENBQUM7SUFDaEcsQ0FBQztDQUNGO0FBUkQsMERBUUMifQ==