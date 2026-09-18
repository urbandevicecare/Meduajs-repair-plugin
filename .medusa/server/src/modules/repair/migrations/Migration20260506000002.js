"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260506000002 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260506000002 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "repair_ticket" add column if not exists "approval_token" text null;`);
    }
    async down() {
        this.addSql(`alter table if exists "repair_ticket" drop column if exists "approval_token";`);
    }
}
exports.Migration20260506000002 = Migration20260506000002;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MDYwMDAwMDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDUwNjAwMDAwMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUMzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQ1QsNEZBQTRGLENBQzdGLENBQUM7SUFDSixDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FDVCwrRUFBK0UsQ0FDaEYsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQVpELDBEQVlDIn0=