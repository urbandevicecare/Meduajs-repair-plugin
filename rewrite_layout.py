import re

with open('src/admin/routes/repairs/[id]/page.tsx', 'r') as f:
    content = f.read()

# 1. Change the grid container
content = content.replace(
    '<div className="grid grid-cols-2 gap-6">',
    '<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">'
)
content = content.replace(
    '{/* Left Column */}\n        <div className="space-y-6">',
    '{/* Left Column */}\n        <div className="xl:col-span-7 space-y-6">\n          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg shadow-sm overflow-hidden">'
)

# 2. Change <Container> in Left Column to <div className="p-6 border-b border-ui-border-base">
content = content.replace(
    '<Container>\n            <Heading level="h2" className="mb-4">\n              Issue Details\n            </Heading>',
    '<div className="p-6 border-b border-ui-border-base">\n            <Heading level="h2" className="mb-4">\n              Issue Details\n            </Heading>'
)
# Close Issue Details Container
content = content.replace(
    '</div>\n          </Container>\n\n          {/* Cost Breakdown */}',
    '</div>\n          </div>\n\n          {/* Cost Breakdown */}'
)

content = content.replace(
    '<Container>\n            <Heading level="h2" className="mb-4">\n              Cost Breakdown\n            </Heading>',
    '<div className="p-6 border-b border-ui-border-base">\n            <Heading level="h2" className="mb-4">\n              Cost Breakdown\n            </Heading>'
)
# Close Cost Breakdown Container
content = content.replace(
    '</div>\n              )}\n            </div>\n          </Container>\n\n          {/* Parts & Inventory */}',
    '</div>\n              )}\n            </div>\n          </div>\n\n          {/* Parts & Inventory */}'
)

content = content.replace(
    '<Container>\n            <Heading level="h2" className="mb-4">\n              Parts & Inventory\n            </Heading>',
    '<div className="p-6">\n            <Heading level="h2" className="mb-4">\n              Parts & Inventory\n            </Heading>'
)
# Close Parts & Inventory Container and close the big bg-ui-bg-base wrapper
content = content.replace(
    '</div>\n            </div>\n          </Container>\n\n          {/* Media */}',
    '</div>\n            </div>\n          </div>\n          </div>\n\n          {/* Media */}'
)

# 3. Handle Right Column Update Details
# We want to extract Update Details and put it BEFORE Parts & Inventory or Cost Breakdown.
# Actually, the user asked for: Issue Details, Update Details, Parts & Inventory (in one widget).
