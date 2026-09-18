"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260918000000 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260918000000 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "repair_ticket" add column if not exists "amount_paid" numeric not null default 0;');
    }
    async down() {
        this.addSql('alter table if exists "repair_ticket" drop column if exists "amount_paid";');
    }
}
exports.Migration20260918000000 = Migration20260918000000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA5MTgwMDAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDkxODAwMDAwMC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsMEdBQTBHLENBQUMsQ0FBQztJQUMxSCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLDRFQUE0RSxDQUFDLENBQUM7SUFDNUYsQ0FBQztDQUNGO0FBUkQsMERBUUMifQ==