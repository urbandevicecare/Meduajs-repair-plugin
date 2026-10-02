"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20261002000002 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20261002000002 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "repair_ticket" drop constraint if exists "repair_ticket_status_check";');
        this.addSql('alter table "repair_ticket" add constraint "repair_ticket_status_check" check (status in (\'pending_dropoff\', \'received\', \'diagnosing\', \'awaiting_approval\', \'approved\', \'repairing\', \'ready\', \'completed\', \'collected\', \'cancelled\', \'refunded\'));');
    }
    async down() {
        this.addSql('alter table "repair_ticket" drop constraint if exists "repair_ticket_status_check";');
        this.addSql('alter table "repair_ticket" add constraint "repair_ticket_status_check" check (status in (\'pending_dropoff\', \'received\', \'diagnosing\', \'awaiting_approval\', \'approved\', \'repairing\', \'ready\', \'completed\', \'cancelled\', \'refunded\'));');
    }
}
exports.Migration20261002000002 = Migration20261002000002;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjEwMDIwMDAwMDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MTAwMjAwMDAwMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMscUZBQXFGLENBQUMsQ0FBQztRQUNuRyxJQUFJLENBQUMsTUFBTSxDQUFDLDBRQUEwUSxDQUFDLENBQUM7SUFDMVIsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxRkFBcUYsQ0FBQyxDQUFDO1FBQ25HLElBQUksQ0FBQyxNQUFNLENBQUMsMlBBQTJQLENBQUMsQ0FBQztJQUMzUSxDQUFDO0NBQ0Y7QUFWRCwwREFVQyJ9