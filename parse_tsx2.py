with open('src/admin/routes/repairs/[id]/page.tsx', 'r') as f:
    lines = f.readlines()

grid_lines = lines[538:1125]
grid_text = "".join(grid_lines)

sections = [
    "Issue Details",
    "Cost Breakdown",
    "Parts & Inventory",
    "Media",
    "Update Details",
    "Timeline & Communication"
]

import re

extracted = {}

for sec in sections:
    match = re.search(r'\{\/\* ' + sec + r' \*\/.*?<Container>(.*?)</Container>', grid_text, re.DOTALL)
    if match:
        extracted[sec] = match.group(1)
    else:
        # try without <Container> wrapper in case it's Media
        if sec == "Media":
            match = re.search(r'\{\/\* Media \*\/.*?\{ticket\.media.*?<Container>(.*?)</Container>.*?\}', grid_text, re.DOTALL)
            if match:
                extracted[sec] = match.group(0) # Keep the conditional wrapper
                
print("Found sections:")
for k in extracted:
    print(f"- {k} ({len(extracted[k])} chars)")
