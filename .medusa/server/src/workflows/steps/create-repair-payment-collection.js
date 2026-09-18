"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepairPaymentCollectionStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../../modules/repair");
exports.createRepairPaymentCollectionStep = (0, workflows_sdk_1.createStep)("create-repair-payment-collection", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const paymentModuleService = container.resolve(utils_1.Modules.PAYMENT);
    // Fetch the ticket details
    const ticket = await repairService.retrieveRepairTicket(input.repair_ticket_id);
    // Determine region and currency
    let currencyCode = "usd";
    let regionId = undefined;
    try {
        const regionModuleService = container.resolve(utils_1.Modules.REGION);
        const regions = await regionModuleService.listRegions({}, { take: 1 });
        if (regions && regions.length > 0) {
            currencyCode = regions[0].currency_code;
            regionId = regions[0].id;
        }
    }
    catch (e) {
        // Ignore if region module is not available or has no regions
    }
    // Create the payment collection
    const paymentCollection = await paymentModuleService.createPaymentCollections({
        currency_code: currencyCode,
        amount: Number(ticket.total_estimate),
        metadata: {
            repair_ticket_id: ticket.id,
        },
    });
    // Update the repair ticket with the newly created payment collection ID
    await repairService.updateRepairTickets({
        id: ticket.id,
        payment_collection_id: paymentCollection.id,
    });
    return new workflows_sdk_1.StepResponse({ paymentCollection }, paymentCollection.id);
}, async (paymentCollectionId, { container }) => {
    if (!paymentCollectionId)
        return;
    const paymentModuleService = container.resolve(utils_1.Modules.PAYMENT);
    await paymentModuleService.deletePaymentCollections([paymentCollectionId]);
    // Also clear it from the ticket? The database transaction might rollback, so this might not be needed.
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXJlcGFpci1wYXltZW50LWNvbGxlY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL3N0ZXBzL2NyZWF0ZS1yZXBhaXItcGF5bWVudC1jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUE2RTtBQUM3RSxxREFBb0Q7QUFDcEQsaURBQXFEO0FBR3hDLFFBQUEsaUNBQWlDLEdBQUcsSUFBQSwwQkFBVSxFQUN6RCxrQ0FBa0MsRUFDbEMsS0FBSyxFQUNILEtBQWdFLEVBQ2hFLEVBQUUsU0FBUyxFQUFFLEVBQ2IsRUFBRTtJQUNGLE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUM1RSxNQUFNLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWhFLDJCQUEyQjtJQUMzQixNQUFNLE1BQU0sR0FBRyxNQUFNLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUVoRixnQ0FBZ0M7SUFDaEMsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLElBQUksUUFBUSxHQUF1QixTQUFTLENBQUM7SUFFN0MsSUFBSSxDQUFDO1FBQ0gsTUFBTSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5RCxNQUFNLE9BQU8sR0FBRyxNQUFNLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2RSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2xDLFlBQVksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO1lBQ3hDLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLDZEQUE2RDtJQUMvRCxDQUFDO0lBRUQsZ0NBQWdDO0lBQ2hDLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQztRQUM1RSxhQUFhLEVBQUUsWUFBWTtRQUMzQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7UUFDckMsUUFBUSxFQUFFO1lBQ1IsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLEVBQUU7U0FDNUI7S0FDRixDQUFDLENBQUM7SUFFSCx3RUFBd0U7SUFDeEUsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDdEMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ2IscUJBQXFCLEVBQUUsaUJBQWlCLENBQUMsRUFBRTtLQUM1QyxDQUFDLENBQUM7SUFFSCxPQUFPLElBQUksNEJBQVksQ0FBQyxFQUFFLGlCQUFpQixFQUFFLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkUsQ0FBQyxFQUNELEtBQUssRUFBRSxtQkFBbUIsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDM0MsSUFBSSxDQUFDLG1CQUFtQjtRQUFFLE9BQU87SUFDakMsTUFBTSxvQkFBb0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRSxNQUFNLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0lBQzNFLHVHQUF1RztBQUN6RyxDQUFDLENBQ0YsQ0FBQyJ9