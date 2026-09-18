"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260506000001 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260506000001 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "repair_ticket" add column if not exists "custom_parts" jsonb not null default '[]';`);
    }
    async down() {
        this.addSql(`alter table if exists "repair_ticket" drop column if exists "custom_parts";`);
    }
}
exports.Migration20260506000001 = Migration20260506000001;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MDYwMDAwMDEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDUwNjAwMDAwMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUMzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQ1QsNEdBQTRHLENBQzdHLENBQUM7SUFDSixDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FDVCw2RUFBNkUsQ0FDOUUsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQVpELDBEQVlDIn0=