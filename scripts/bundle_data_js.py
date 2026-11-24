#!/usr/bin/env python3
"""
Bundle processed JSON data into src/data.js for zero-fetch instant offline execution.
"""
import json
import os

base_dir = '/Users/ybwdaisy/.gemini/antigravity/scratch/america-unfolded'
proc_dir = os.path.join(base_dir, 'data/processed')

with open(os.path.join(proc_dir, 'territory_shapes.json')) as f:
    territory_shapes = json.load(f)

with open(os.path.join(proc_dir, 'state_shapes.json')) as f:
    state_shapes = json.load(f)

with open(os.path.join(proc_dir, 'timeline_nodes.json')) as f:
    timeline_nodes = json.load(f)

out_file = os.path.join(base_dir, 'src/data.js')

with open(out_file, 'w') as f:
    f.write("// America Unfolded · Historical Data Bundle\n")
    f.write("// Sourced from USGS, US Census Bureau, NARA & Avalon Project\n")
    f.write("window.AMERICA_DATA = {\n")
    f.write(f"  territoryShapes: {json.dumps(territory_shapes, indent=2)},\n")
    f.write(f"  stateShapes: {json.dumps(state_shapes, indent=2)},\n")
    f.write(f"  timelineNodes: {json.dumps(timeline_nodes, indent=2)}\n")
    f.write("};\n")

print(f"Bundled data into {out_file} successfully.")
