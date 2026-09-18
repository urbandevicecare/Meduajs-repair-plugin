"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260917000000 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260917000000 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "repair_ticket" add column if not exists "payment_status" text not null default 'pending';`);
        this.addSql(`alter table if exists "repair_ticket" add column if not exists "payment_collection_id" text;`);
    }
    async down() {
        this.addSql(`alter table if exists "repair_ticket" drop column if exists "payment_status";`);
        this.addSql(`alter table if exists "repair_ticket" drop column if exists "payment_collection_id";`);
    }
}
exports.Migration20260917000000 = Migration20260917000000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA5MTcwMDAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDkxNzAwMDAwMC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUMzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQ1Qsa0hBQWtILENBQ25ILENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUNULDhGQUE4RixDQUMvRixDQUFDO0lBQ0osQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQ1QsK0VBQStFLENBQ2hGLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUNULHNGQUFzRixDQUN2RixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBbEJELDBEQWtCQyJ9