"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260917000003 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260917000003 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "repair_settings" add column if not exists "paystack_enabled" boolean not null default false;');
        this.addSql('alter table if exists "repair_settings" add column if not exists "paystack_public_key" text;');
        this.addSql('alter table if exists "repair_settings" add column if not exists "paystack_secret_key" text;');
    }
    async down() {
        this.addSql('alter table if exists "repair_settings" drop column if exists "paystack_enabled";');
        this.addSql('alter table if exists "repair_settings" drop column if exists "paystack_public_key";');
        this.addSql('alter table if exists "repair_settings" drop column if exists "paystack_secret_key";');
    }
}
exports.Migration20260917000003 = Migration20260917000003;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA5MTcwMDAwMDMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDkxNzAwMDAwMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUVwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMscUhBQXFILENBQUMsQ0FBQztRQUNuSSxJQUFJLENBQUMsTUFBTSxDQUFDLDhGQUE4RixDQUFDLENBQUM7UUFDNUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyw4RkFBOEYsQ0FBQyxDQUFDO0lBQzlHLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsbUZBQW1GLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsTUFBTSxDQUFDLHNGQUFzRixDQUFDLENBQUM7UUFDcEcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzRkFBc0YsQ0FBQyxDQUFDO0lBQ3RHLENBQUM7Q0FFRjtBQWRELDBEQWNDIn0=