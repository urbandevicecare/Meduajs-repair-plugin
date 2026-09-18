"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260918000001 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260918000001 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "repair_ticket" add column if not exists "apply_tax" boolean not null default false;');
    }
    async down() {
        this.addSql('alter table if exists "repair_ticket" drop column if exists "apply_tax";');
    }
}
exports.Migration20260918000001 = Migration20260918000001;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA5MTgwMDAwMDEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDkxODAwMDAwMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsNEdBQTRHLENBQUMsQ0FBQztJQUM1SCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLDBFQUEwRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztDQUNGO0FBUkQsMERBUUMifQ==