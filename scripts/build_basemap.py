#!/usr/bin/env python3
"""
Process Natural Earth countries and lakes into projected basemap layers for America Unfolded.
"""
import json
import math
import os

def p_dist(p, a, b):
    px, py = p[0], p[1]
    ax, ay = a[0], a[1]
    bx, by = b[0], b[1]
    dx = bx - ax
    dy = by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    u = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    u = max(0.0, min(1.0, u))
    ix = ax + u * dx
    iy = ay + u * dy
    return math.hypot(px - ix, py - iy)

def simplify_ring(pts, tol=0.04):
    if len(pts) <= 3:
        return pts
    max_d = 0.0
    idx = 0
    for i in range(1, len(pts) - 1):
        d = p_dist(pts[i], pts[0], pts[-1])
        if d > max_d:
            max_d = d
            idx = i
    if max_d > tol:
        r1 = simplify_ring(pts[:idx + 1], tol)
        r2 = simplify_ring(pts[idx:], tol)
        return r1[:-1] + r2
    return [pts[0], pts[-1]]

def project_conus(lon, lat):
    phi1 = math.radians(29.5)
    phi2 = math.radians(45.5)
    phi0 = math.radians(37.5)
    lam0 = math.radians(-96.0)
    phi = math.radians(lat)
    lam = math.radians(lon)

    n = 0.5 * (math.sin(phi1) + math.sin(phi2))
    C = math.cos(phi1)**2 + 2 * n * math.sin(phi1)
    rho0 = math.sqrt(max(0.0, C - 2 * n * math.sin(phi0))) / n
    rho = math.sqrt(max(0.0, C - 2 * n * math.sin(phi))) / n
    theta = n * (lam - lam0)

    scale = 1070.0
    tx = 480.0
    ty = 270.0
    x = tx + scale * rho * math.sin(theta)
    y = ty - scale * (rho0 - rho * math.cos(theta))
    return x, y

def geometry_to_svg_path(geom, bbox_filter=None, tol=0.04):
    gtype = geom['type']
    coords = geom['coordinates']
    polygons = []
    if gtype == 'Polygon':
        polygons = [coords]
    elif gtype == 'MultiPolygon':
        polygons = coords

    path_parts = []
    for poly in polygons:
        for ring_idx, ring in enumerate(poly):
            # Check bounding box filter if specified
            if bbox_filter:
                min_lon, min_lat, max_lon, max_lat = bbox_filter
                # If ring is completely outside bbox, skip
                ring_lons = [p[0] for p in ring]
                ring_lats = [p[1] for p in ring]
                if (max(ring_lons) < min_lon or min(ring_lons) > max_lon or
                    max(ring_lats) < min_lat or min(ring_lats) > max_lat):
                    continue

            s_ring = simplify_ring(ring, tol)
            if len(s_ring) < 3:
                continue
            ring_cmds = []
            for i, pt in enumerate(s_ring):
                # Clamp extreme latitudes to avoid projection singularities
                clamped_lat = max(10.0, min(65.0, pt[1]))
                clamped_lon = max(-175.0, min(-50.0, pt[0]))
                px, py = project_conus(clamped_lon, clamped_lat)
                cmd = 'M' if i == 0 else 'L'
                ring_cmds.append(f"{cmd}{px:.1f},{py:.1f}")
            ring_cmds.append("Z")
            path_parts.append("".join(ring_cmds))

    return " ".join(path_parts)

def main():
    base_dir = '/Users/ybwdaisy/.gemini/antigravity/scratch/america-unfolded'
    raw_dir = os.path.join(base_dir, 'data/raw')
    out_dir = os.path.join(base_dir, 'data/processed')

    print("Building basemap layers...")
    with open(os.path.join(raw_dir, 'ne_countries.geojson')) as f:
        countries_raw = json.load(f)

    with open(os.path.join(raw_dir, 'ne_lakes.geojson')) as f:
        lakes_raw = json.load(f)

    # 1. Canada (British North America)
    can_path = ""
    mex_path = ""
    cub_path = ""
    bhs_path = ""

    for feat in countries_raw['features']:
        iso = feat['properties'].get('ISO_A3') or feat['properties'].get('ADM0_A3')
        if iso == 'CAN':
            # Southern Canada near US border
            can_path = geometry_to_svg_path(feat['geometry'], bbox_filter=(-145, 42, -50, 60), tol=0.08)
        elif iso == 'MEX':
            # Mexico
            mex_path = geometry_to_svg_path(feat['geometry'], bbox_filter=(-122, 14, -85, 34), tol=0.08)
        elif iso == 'CUB':
            cub_path = geometry_to_svg_path(feat['geometry'], tol=0.06)
        elif iso == 'BHS':
            bhs_path = geometry_to_svg_path(feat['geometry'], tol=0.06)

    # 2. Great Lakes
    great_lakes_names = ['Lake Superior', 'Lake Huron', 'Lake Michigan', 'Lake Erie', 'Lake Ontario', 'Great Salt Lake']
    great_lakes_paths = []
    for feat in lakes_raw['features']:
        name = feat['properties'].get('name')
        if name in great_lakes_names:
            p = geometry_to_svg_path(feat['geometry'], tol=0.03)
            great_lakes_paths.append({
                'name': name,
                'path': p
            })

    # 3. Contiguous US Continental Baseline (combined state boundaries)
    # Load state shapes for lower 48
    with open(os.path.join(out_dir, 'state_shapes.json')) as f:
        states = json.load(f)

    conus_paths = [st['path'] for st in states if st['regionType'] == 'conus']
    conus_combined_path = " ".join(conus_paths)

    basemap_data = {
        'canada': can_path,
        'mexico': mex_path,
        'cuba': cub_path,
        'bahamas': bhs_path,
        'greatLakes': great_lakes_paths,
        'conusBaseline': conus_combined_path
    }

    with open(os.path.join(out_dir, 'basemap_shapes.json'), 'w') as f:
        json.dump(basemap_data, f)

    print("Basemap data generated successfully. Size:", os.path.getsize(os.path.join(out_dir, 'basemap_shapes.json')), "bytes")

if __name__ == '__main__':
    main()
