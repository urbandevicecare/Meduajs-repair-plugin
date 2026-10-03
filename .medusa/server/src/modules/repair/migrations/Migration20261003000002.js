"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20261003000002 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20261003000002 extends migrations_1.Migration {
    async up() {
        this.addSql('create table if not exists "repair_link" ("id" text not null, "shortcode" text not null, "url" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "repair_link_pkey" primary key ("id"));');
        this.addSql('create unique index if not exists "IDX_repair_link_shortcode" on "repair_link" ("shortcode") where "deleted_at" is null;');
    }
    async down() {
        this.addSql('drop table if exists "repair_link" cascade;');
    }
}
exports.Migration20261003000002 = Migration20261003000002;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjEwMDMwMDAwMDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MTAwMzAwMDAwMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsbVNBQW1TLENBQUMsQ0FBQztRQUNqVCxJQUFJLENBQUMsTUFBTSxDQUFDLDBIQUEwSCxDQUFDLENBQUM7SUFDMUksQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0lBQzdELENBQUM7Q0FDRjtBQVRELDBEQVNDIn0=