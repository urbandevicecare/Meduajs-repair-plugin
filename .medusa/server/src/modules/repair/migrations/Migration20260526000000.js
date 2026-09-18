"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260526000000 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260526000000 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "repair_ticket" alter column "custom_parts" drop not null;`);
    }
    async down() {
        this.addSql(`alter table if exists "repair_ticket" alter column "custom_parts" set not null;`);
    }
}
exports.Migration20260526000000 = Migration20260526000000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MjYwMDAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDUyNjAwMDAwMC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUMzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQ1Qsa0ZBQWtGLENBQ25GLENBQUM7SUFDSixDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FDVCxpRkFBaUYsQ0FDbEYsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQVpELDBEQVlDIn0=