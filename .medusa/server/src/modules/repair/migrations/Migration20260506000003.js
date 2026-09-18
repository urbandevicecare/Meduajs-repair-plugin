"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260506000003 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260506000003 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "repair_ticket" add column if not exists "terms_accepted" boolean not null default false;`);
        this.addSql(`alter table if exists "repair_ticket" add column if not exists "data_wiped_consent" boolean not null default false;`);
    }
    async down() {
        this.addSql(`alter table if exists "repair_ticket" drop column if exists "terms_accepted";`);
        this.addSql(`alter table if exists "repair_ticket" drop column if exists "data_wiped_consent";`);
    }
}
exports.Migration20260506000003 = Migration20260506000003;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA1MDYwMDAwMDMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDUwNjAwMDAwMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUMzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQ1QsaUhBQWlILENBQ2xILENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUNULHFIQUFxSCxDQUN0SCxDQUFDO0lBQ0osQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQ1QsK0VBQStFLENBQ2hGLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUNULG1GQUFtRixDQUNwRixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBbEJELDBEQWtCQyJ9