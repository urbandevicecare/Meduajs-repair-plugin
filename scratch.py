with open("src/api/admin/repairs/[id]/mark-paid/route.ts", "r") as f:
    code = f.read()

code = code.replace(
    'const { amount, method } = req.body as { amount?: number, method?: string };',
    'const { amount, method, reference } = req.body as { amount?: number, method?: string, reference?: string };'
)

code = code.replace(
    '''  const updatedTicket = await repairService.updateRepairTickets({
    id,
    amount_paid: newAmountPaid,
    payment_status: isFullyPaid ? "captured" : "pending",
    status: newStatus
  });''',
    '''  const updatedTicket = await repairService.updateRepairTickets({
    id,
    amount_paid: newAmountPaid,
    payment_status: isFullyPaid ? "captured" : "pending",
    status: newStatus,
    payment_collection_id: reference || ticket.payment_collection_id
  });'''
)

code = code.replace(
    'await syncPaymentToZoho(req.scope as any, id, amountToPay, method || "Cash");',
    'await syncPaymentToZoho(req.scope as any, id, amountToPay, method || "Cash", reference);'
)

with open("src/api/admin/repairs/[id]/mark-paid/route.ts", "w") as f:
    f.write(code)
