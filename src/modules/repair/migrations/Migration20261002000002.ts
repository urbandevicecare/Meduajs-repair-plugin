import { Migration } from '@mikro-orm/migrations';

export class Migration20261002000002 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "repair_ticket" drop constraint if exists "repair_ticket_status_check";');
    this.addSql('alter table "repair_ticket" add constraint "repair_ticket_status_check" check (status in (\'pending_dropoff\', \'received\', \'diagnosing\', \'awaiting_approval\', \'approved\', \'repairing\', \'ready\', \'completed\', \'collected\', \'cancelled\', \'refunded\'));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "repair_ticket" drop constraint if exists "repair_ticket_status_check";');
    this.addSql('alter table "repair_ticket" add constraint "repair_ticket_status_check" check (status in (\'pending_dropoff\', \'received\', \'diagnosing\', \'awaiting_approval\', \'approved\', \'repairing\', \'ready\', \'completed\', \'cancelled\', \'refunded\'));');
  }
}
