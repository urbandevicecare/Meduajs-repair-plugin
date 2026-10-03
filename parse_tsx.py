import sys

def parse_file(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
        
    start_grid = -1
    for i, line in enumerate(lines):
        if '<div className="grid grid-cols-2 gap-6">' in line:
            start_grid = i
            break
            
    if start_grid == -1:
        print("Could not find grid")
        return
        
    end_grid = -1
    open_divs = 0
    for i in range(start_grid, len(lines)):
        line = lines[i]
        if '<div' in line:
            open_divs += line.count('<div')
        if '</div' in line:
            open_divs -= line.count('</div')
            if open_divs == 0:
                end_grid = i
                break
                
    print(f"Grid is from {start_grid} to {end_grid}")

parse_file('src/admin/routes/repairs/[id]/page.tsx')
