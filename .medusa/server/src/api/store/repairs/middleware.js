"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeRepairMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const zod_1 = require("@medusajs/framework/zod");
const http_1 = require("@medusajs/framework/http");
const AddMessageSchema = zod_1.z.object({
    message: zod_1.z.string(),
    token: zod_1.z.string().optional(),
});
exports.storeRepairMiddlewares = [
    {
        method: ["POST"],
        matcher: "/store/repairs/:id/messages",
        middlewares: [(0, framework_1.validateAndTransformBody)(AddMessageSchema)],
    },
    {
        method: ["POST"],
        matcher: "/store/repairs/:id/approve",
        middlewares: [(0, http_1.authenticate)("customer", ["session", "bearer"])],
    },
    {
        method: ["POST"],
        matcher: "/store/repairs/:id/compliance",
        middlewares: [(0, http_1.authenticate)("customer", ["session", "bearer"])],
    }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9hcGkvc3RvcmUvcmVwYWlycy9taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1EQUFnRjtBQUNoRixpREFBNEM7QUFDNUMsbURBQXdEO0FBRXhELE1BQU0sZ0JBQWdCLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNoQyxPQUFPLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNuQixLQUFLLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUM3QixDQUFDLENBQUM7QUFFVSxRQUFBLHNCQUFzQixHQUFzQjtJQUN2RDtRQUNFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNoQixPQUFPLEVBQUUsNkJBQTZCO1FBQ3RDLFdBQVcsRUFBRSxDQUFDLElBQUEsb0NBQXdCLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUMxRDtJQUNEO1FBQ0UsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ2hCLE9BQU8sRUFBRSw0QkFBNEI7UUFDckMsV0FBVyxFQUFFLENBQUMsSUFBQSxtQkFBWSxFQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQy9EO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDaEIsT0FBTyxFQUFFLCtCQUErQjtRQUN4QyxXQUFXLEVBQUUsQ0FBQyxJQUFBLG1CQUFZLEVBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDL0Q7Q0FDRixDQUFDIn0=