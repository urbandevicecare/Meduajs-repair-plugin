const fs = require('fs');
let content = fs.readFileSync('src/admin/routes/repairs/page.tsx', 'utf8');

content = content.replace('{ticket.status.replace("_", " ")}', '{ticket.status === "completed" ? "Paid" : ticket.status.replace("_", " ")}');
content = content.replace('<Select.Item value="completed">Completed</Select.Item>', '<Select.Item value="completed">Paid</Select.Item>\n            <Select.Item value="collected">Collected</Select.Item>');

fs.writeFileSync('src/admin/routes/repairs/page.tsx', content);

let content2 = fs.readFileSync('src/admin/routes/repairs/[id]/page.tsx', 'utf8');
content2 = content2.replace('<Select.Item value="completed" disabled={!ticket?.is_approved}>\n                      Completed {!ticket?.is_approved && "(Requires Approval)"}\n                    </Select.Item>', '<Select.Item value="completed" disabled={!ticket?.is_approved}>\n                      Paid {!ticket?.is_approved && "(Requires Approval)"}\n                    </Select.Item>\n                    <Select.Item value="collected" disabled={!ticket?.is_approved}>\n                      Collected {!ticket?.is_approved && "(Requires Approval)"}\n                    </Select.Item>');
fs.writeFileSync('src/admin/routes/repairs/[id]/page.tsx', content2);
