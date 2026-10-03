with open('src/admin/routes/repairs/[id]/page.tsx', 'r') as f:
    grid_text = "".join(f.readlines()[538:1125])

import re

extracted = {}
# Use greedy match for the content between Container tags
# Since there might be nested tags, it's safer to find `{/* Section Name */}` 
# and then find the first `<Container>` and its matching `</Container>`
# Wait, regular expressions can't balance tags well. Let's write a simple tag balancer.

def extract_section(name, text):
    start_idx = text.find(f'{{/* {name} */}}')
    if start_idx == -1: return None
    container_start = text.find('<Container>', start_idx)
    if container_start == -1: return None
    
    # Simple search for the matching </Container>
    open_count = 1
    i = container_start + len('<Container>')
    while i < len(text) and open_count > 0:
        if text[i:].startswith('<Container>'):
            open_count += 1
            i += len('<Container>')
        elif text[i:].startswith('</Container>'):
            open_count -= 1
            if open_count == 0:
                return text[container_start + len('<Container>'):i]
            i += len('</Container>')
        else:
            i += 1
    return None

sections = ["Issue Details", "Cost Breakdown", "Parts & Inventory", "Media", "Update Details", "Timeline & Communication"]

for sec in sections:
    if sec == "Media":
        match = re.search(r'\{\/\* Media \*\/.*?\{ticket\.media.*?<Container>(.*?)</Container>.*?\}', grid_text, re.DOTALL)
        if match:
            extracted[sec] = match.group(0) # Store the whole wrapper for Media
    else:
        ext = extract_section(sec, grid_text)
        if ext: extracted[sec] = ext

for k in extracted:
    print(f"- {k} ({len(extracted[k])} chars)")

# Now build the new grid!
# Left Side
left_side = []
left_side.append('        <div className="lg:col-span-7 space-y-6">\n          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg shadow-sm overflow-visible">')

left_side.append('            {/* Issue Details */}\n            <div className="p-6 border-b border-ui-border-base">\n' + extracted['Issue Details'] + '\n            </div>')
left_side.append('            {/* Update Details */}\n            <div className="p-6 border-b border-ui-border-base bg-ui-bg-subtle/20">\n' + extracted['Update Details'] + '\n            </div>')
left_side.append('            {/* Parts & Inventory */}\n            <div className="p-6 border-b border-ui-border-base overflow-visible">\n' + extracted['Parts & Inventory'] + '\n            </div>')
left_side.append('            {/* Cost Breakdown */}\n            <div className="p-6">\n' + extracted['Cost Breakdown'] + '\n            </div>')
left_side.append('          </div>\n\n' + extracted.get('Media', ''))
left_side.append('        </div>')

# Right Side
timeline = extracted['Timeline & Communication']
# Remove the border from Timeline timeline box
timeline = timeline.replace('max-h-80 overflow-y-auto mb-4 border rounded bg-ui-bg-subtle/50 p-2', 'max-h-[600px] overflow-y-auto mb-4 pl-4 border-l-2 border-ui-border-base ml-2')
# Remove borders from text area
timeline = timeline.replace('p-3 bg-ui-bg-subtle rounded border', 'p-3')

right_side = []
right_side.append('        <div className="lg:col-span-5">\n          {/* Timeline & Communication */}')
right_side.append(timeline)
right_side.append('\n        </div>')

new_grid = '      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">\n' + "\n".join(left_side) + '\n' + "\n".join(right_side) + '\n      </div>'

with open('src/admin/routes/repairs/[id]/page.tsx', 'r') as f:
    original = f.read()

before = original[:original.find('<div className="grid grid-cols-2 gap-6">')]
after = original[original.find('    </div>\n  );\n};', original.find('<div className="grid grid-cols-2 gap-6">')):]

with open('src/admin/routes/repairs/[id]/page.tsx', 'w') as f:
    f.write(before + new_grid + '\n' + after)

print("Saved new layout!")
