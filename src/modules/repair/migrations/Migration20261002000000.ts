import { Migration } from '@mikro-orm/migrations';

export class Migration20261002000000 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "repair_ticket" drop constraint if exists "repair_ticket_status_check";');
    this.addSql('alter table "repair_ticket" add constraint "repair_ticket_status_check" check ("status" in (\'pending_dropoff\', \'received\', \'diagnosing\', \'awaiting_approval\', \'repairing\', \'ready\', \'completed\', \'cancelled\', \'refunded\'));');
    this.addSql('alter table "repair_ticket" alter column "status" set default \'pending_dropoff\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "repair_ticket" drop constraint if exists "repair_ticket_status_check";');
    this.addSql('alter table "repair_ticket" add constraint "repair_ticket_status_check" check ("status" in (\'received\', \'diagnosing\', \'awaiting_approval\', \'repairing\', \'ready\', \'completed\', \'cancelled\', \'refunded\'));');
    this.addSql('alter table "repair_ticket" alter column "status" set default \'received\';');
  }
}
