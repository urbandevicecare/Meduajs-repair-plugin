"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("@medusajs/framework/http");
const middleware_1 = require("./admin/repairs/middleware");
const middleware_2 = require("./store/repairs/middleware");
exports.default = (0, http_1.defineMiddlewares)({
    routes: [
        ...middleware_1.repairMiddlewares,
        ...middleware_2.storeRepairMiddlewares,
        {
            method: ["GET"],
            matcher: "/store/customers/me/repairs",
            middlewares: [(0, http_1.authenticate)("customer", ["session", "bearer"])],
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpL21pZGRsZXdhcmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQTJFO0FBQzNFLDJEQUErRDtBQUMvRCwyREFBb0U7QUFFcEUsa0JBQWUsSUFBQSx3QkFBaUIsRUFBQztJQUMvQixNQUFNLEVBQUU7UUFDTixHQUFHLDhCQUFpQjtRQUNwQixHQUFHLG1DQUFzQjtRQUN6QjtZQUNFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNmLE9BQU8sRUFBRSw2QkFBNkI7WUFDdEMsV0FBVyxFQUFFLENBQUMsSUFBQSxtQkFBWSxFQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQy9EO0tBQ0Y7Q0FDRixDQUFDLENBQUMifQ==