"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRepairNoteStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.addRepairNoteStep = (0, workflows_sdk_1.createStep)("add-repair-note", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const note = await repairService.createRepairNotes(input);
    return new workflows_sdk_1.StepResponse(note, note.id);
}, async (noteId, { container }) => {
    if (!noteId)
        return;
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    await repairService.deleteRepairNotes(noteId);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLXJlcGFpci1ub3RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9zdGVwcy9hZGQtcmVwYWlyLW5vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBQTZFO0FBQzdFLGlEQUFxRDtBQVd4QyxRQUFBLGlCQUFpQixHQUFHLElBQUEsMEJBQVUsRUFDekMsaUJBQWlCLEVBQ2pCLEtBQUssRUFBRSxLQUF5QixFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUNqRCxNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFFNUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxhQUFhLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFMUQsT0FBTyxJQUFJLDRCQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxDQUFDLEVBQ0QsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDOUIsSUFBSSxDQUFDLE1BQU07UUFBRSxPQUFPO0lBQ3BCLE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUM1RSxNQUFNLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRCxDQUFDLENBQ0YsQ0FBQyJ9