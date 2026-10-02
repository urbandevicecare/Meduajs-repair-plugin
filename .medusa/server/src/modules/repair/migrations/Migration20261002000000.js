"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20261002000000 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20261002000000 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "repair_ticket" drop constraint if exists "repair_ticket_status_check";');
        this.addSql('alter table "repair_ticket" add constraint "repair_ticket_status_check" check ("status" in (\'pending_dropoff\', \'received\', \'diagnosing\', \'awaiting_approval\', \'repairing\', \'ready\', \'completed\', \'cancelled\', \'refunded\'));');
        this.addSql('alter table "repair_ticket" alter column "status" set default \'pending_dropoff\';');
    }
    async down() {
        this.addSql('alter table "repair_ticket" drop constraint if exists "repair_ticket_status_check";');
        this.addSql('alter table "repair_ticket" add constraint "repair_ticket_status_check" check ("status" in (\'received\', \'diagnosing\', \'awaiting_approval\', \'repairing\', \'ready\', \'completed\', \'cancelled\', \'refunded\'));');
        this.addSql('alter table "repair_ticket" alter column "status" set default \'received\';');
    }
}
exports.Migration20261002000000 = Migration20261002000000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjEwMDIwMDAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MTAwMjAwMDAwMC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNwRCxLQUFLLENBQUMsRUFBRTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMscUZBQXFGLENBQUMsQ0FBQztRQUNuRyxJQUFJLENBQUMsTUFBTSxDQUFDLCtPQUErTyxDQUFDLENBQUM7UUFDN1AsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvRkFBb0YsQ0FBQyxDQUFDO0lBQ3BHLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMscUZBQXFGLENBQUMsQ0FBQztRQUNuRyxJQUFJLENBQUMsTUFBTSxDQUFDLDBOQUEwTixDQUFDLENBQUM7UUFDeE8sSUFBSSxDQUFDLE1BQU0sQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO0lBQzdGLENBQUM7Q0FDRjtBQVpELDBEQVlDIn0=