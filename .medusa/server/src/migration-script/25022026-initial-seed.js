"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = migration_25022026_initial_seed;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
async function migration_25022026_initial_seed({ container, }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const storeModuleService = container.resolve(utils_1.ModuleRegistrationName.STORE);
    const salesChannelModuleService = container.resolve(utils_1.ModuleRegistrationName.SALES_CHANNEL);
    const fulfillmentModuleService = container.resolve(utils_1.ModuleRegistrationName.FULFILLMENT);
    const { data: existingProductsAtStartup } = await query.graph({
        entity: "product",
        fields: ["id"],
    });
    // If we want to explicitly not seed data, or if it's an existing project with data seeded in a different way, skip the seeding.
    if (process.env.SKIP_INITIAL_SEED === "true" ||
        existingProductsAtStartup.length > 0) {
        return;
    }
    logger.info("Seeding defaults...");
    await (0, core_flows_1.createDefaultsWorkflow)(container).run();
    const [store] = await storeModuleService.listStores();
    let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });
    await (0, core_flows_1.updateStoresWorkflow)(container).run({
        input: {
            selector: { id: store.id },
            update: {
                supported_currencies: [
                    { currency_code: "usd", is_default: true },
                    { currency_code: "eur", is_tax_inclusive: true },
                ],
                default_sales_channel_id: defaultSalesChannel[0].id,
            },
        },
    });
    const { data: pricePreferences } = await query.graph({
        entity: "price_preference",
        fields: ["id"],
    });
    if (pricePreferences.length > 0) {
        const ids = pricePreferences.map((pp) => pp.id);
        await container.resolve(utils_1.Modules.PRICING).deletePricePreferences(ids);
    }
    const europeanCountries = ["gb", "de", "dk", "se", "fr", "es", "it"];
    const { data: existingRegions } = await query.graph({
        entity: "region",
        fields: ["id", "name"],
    });
    let usRegion;
    let europeRegion;
    if (!existingRegions.length) {
        logger.info("Creating regions...");
        const { result: regionResult } = await (0, core_flows_1.createRegionsWorkflow)(container).run({
            input: {
                regions: [
                    {
                        name: "US",
                        currency_code: "usd",
                        countries: ["us"],
                        payment_providers: ["pp_system_default"],
                        automatic_taxes: false,
                        is_tax_inclusive: false,
                    },
                    {
                        name: "Europe",
                        currency_code: "eur",
                        countries: europeanCountries,
                        payment_providers: ["pp_system_default"],
                        automatic_taxes: true,
                        is_tax_inclusive: true,
                    },
                ],
            },
        });
        usRegion = regionResult[0];
        europeRegion = regionResult[1];
    }
    else {
        logger.info("Regions already exist, skipping creation...");
        usRegion = existingRegions.find((r) => r.name === "US");
        europeRegion = existingRegions.find((r) => r.name === "Europe");
    }
    const { data: existingTaxRegions } = await query.graph({
        entity: "tax_region",
        fields: ["id", "name"],
    });
    if (!existingTaxRegions.length) {
        logger.info("Seeding tax regions...");
        const taxRates = {
            gb: { rate: 20, code: "GB20", name: "UK VAT" },
            de: { rate: 19, code: "DE19", name: "Germany VAT" },
            dk: { rate: 25, code: "DK25", name: "Denmark VAT" },
            se: { rate: 25, code: "SE25", name: "Sweden VAT" },
            fr: { rate: 20, code: "FR20", name: "France VAT" },
            es: { rate: 21, code: "ES21", name: "Spain VAT" },
            it: { rate: 22, code: "IT22", name: "Italy VAT" },
        };
        await (0, core_flows_1.createTaxRegionsWorkflow)(container).run({
            input: Object.entries(taxRates).map(([country_code, taxConfig]) => {
                return {
                    country_code,
                    provider_id: "tp_system",
                    default_tax_rate: {
                        rate: taxConfig.rate,
                        code: taxConfig.code,
                        name: taxConfig.name,
                        is_default: true,
                    },
                };
            }),
        });
        logger.info("Finished seeding tax regions.");
    }
    else {
        logger.info("Tax regions already exist, skipping creation...");
    }
    const { data: existingStockLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
    });
    let stockLocation;
    if (!existingStockLocations.length) {
        logger.info("Seeding stock location data...");
        const { result: stockLocationResult } = await (0, core_flows_1.createStockLocationsWorkflow)(container).run({
            input: {
                locations: [
                    {
                        name: "Main Warehouse",
                        address: {
                            city: "",
                            country_code: "US",
                            address_1: "",
                        },
                    },
                ],
            },
        });
        stockLocation = stockLocationResult[0];
        await link.create({
            [utils_1.Modules.STOCK_LOCATION]: {
                stock_location_id: stockLocation.id,
            },
            [utils_1.Modules.FULFILLMENT]: {
                fulfillment_provider_id: "manual_manual",
            },
        });
    }
    else {
        logger.info("Stock location already exists, skipping creation...");
        stockLocation = existingStockLocations[0];
    }
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
        type: "default",
    });
    let shippingProfile;
    if (!shippingProfiles.length) {
        logger.info("Creating shipping profile...");
        const { result: shippingProfileResult } = await (0, core_flows_1.createShippingProfilesWorkflow)(container).run({
            input: {
                data: [
                    {
                        name: "Default Shipping Profile",
                        type: "default",
                    },
                ],
            },
        });
        shippingProfile = shippingProfileResult[0];
    }
    else {
        logger.info("Shipping profile already exists, skipping creation...");
        shippingProfile = shippingProfiles[0];
    }
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets();
    let fulfillmentSet;
    if (!fulfillmentSets.length) {
        logger.info("Creating fulfillment set...");
        fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
            name: "Main Warehouse Delivery",
            type: "shipping",
            service_zones: [
                {
                    name: "Worldwide",
                    geo_zones: ["us", ...europeanCountries].map((country_code) => ({
                        country_code,
                        type: "country",
                    })),
                },
            ],
        });
        await link.create({
            [utils_1.Modules.STOCK_LOCATION]: {
                stock_location_id: stockLocation.id,
            },
            [utils_1.Modules.FULFILLMENT]: {
                fulfillment_set_id: fulfillmentSet.id,
            },
        });
    }
    else {
        logger.info("Fulfillment set already exists, skipping creation...");
        fulfillmentSet = fulfillmentSets[0];
    }
    const { data: existingShippingOptions } = await query.graph({
        entity: "shipping_option",
        fields: ["id", "name"],
    });
    if (!existingShippingOptions.length) {
        logger.info("Creating shipping option...");
        await (0, core_flows_1.createShippingOptionsWorkflow)(container).run({
            input: [
                {
                    name: "Standard Worldwide Shipping",
                    price_type: "flat",
                    provider_id: "manual_manual",
                    service_zone_id: fulfillmentSet.service_zones[0].id,
                    shipping_profile_id: shippingProfile.id,
                    type: {
                        label: "Standard",
                        description: "Ships worldwide",
                        code: "standard-worldwide",
                    },
                    prices: [
                        {
                            currency_code: "usd",
                            amount: 10,
                        },
                        {
                            currency_code: "eur",
                            amount: 10,
                        },
                    ],
                    rules: [
                        {
                            attribute: "enabled_in_store",
                            value: "true",
                            operator: "eq",
                        },
                        {
                            attribute: "is_return",
                            value: "false",
                            operator: "eq",
                        },
                    ],
                },
            ],
        });
    }
    else {
        logger.info("Shipping option already exists, skipping creation...");
    }
    await (0, core_flows_1.linkSalesChannelsToStockLocationWorkflow)(container).run({
        input: {
            id: stockLocation.id,
            add: [defaultSalesChannel[0].id],
        },
    });
    logger.info("Finished seeding data.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMjUwMjIwMjYtaW5pdGlhbC1zZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL21pZ3JhdGlvbi1zY3JpcHQvMjUwMjIwMjYtaW5pdGlhbC1zZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBaUJBLGtEQXNTQztBQXRURCxxREFJbUM7QUFDbkMsNERBU3FDO0FBRXRCLEtBQUssVUFBVSwrQkFBK0IsQ0FBQyxFQUM1RCxTQUFTLEdBR1Y7SUFDQyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25FLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0QsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRSxNQUFNLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsOEJBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0UsTUFBTSx5QkFBeUIsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUNqRCw4QkFBc0IsQ0FBQyxhQUFhLENBQ3JDLENBQUM7SUFDRixNQUFNLHdCQUF3QixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQ2hELDhCQUFzQixDQUFDLFdBQVcsQ0FDbkMsQ0FBQztJQUVGLE1BQU0sRUFBRSxJQUFJLEVBQUUseUJBQXlCLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDNUQsTUFBTSxFQUFFLFNBQVM7UUFDakIsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsZ0lBQWdJO0lBQ2hJLElBQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsS0FBSyxNQUFNO1FBQ3hDLHlCQUF5QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ3BDLENBQUM7UUFD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