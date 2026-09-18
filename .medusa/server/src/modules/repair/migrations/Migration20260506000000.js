"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260506000000 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260506000000 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "repair_ticket" add column if not exists "technician_id" text null;`);
        this.addSql(`alter table if exists "repair_ticket" add column if not exists "technician_name" text null;`);
    }
    async down() {
        this.addSql(`alter table if exists "repair_ticket" drop column if exists "technician_id";`);
        this.addSql(`alter table if exists "repair_ticket" drop column if exists "technician_name";`);
    }
}
exports.Migration20260506000000 = Migration20260506000000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MDYwMDAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDUwNjAwMDAwMC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUMzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQ1QsMkZBQTJGLENBQzVGLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUNULDZGQUE2RixDQUM5RixDQUFDO0lBQ0osQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQ1QsOEVBQThFLENBQy9FLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUNULGdGQUFnRixDQUNqRixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBbEJELDBEQWtCQyJ9