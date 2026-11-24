#!/usr/bin/env python3
"""
Process raw USGS/Census boundary datasets into lightweight, projected SVG paths
and timeline metadata for America Unfolded.
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

def simplify_ring(pts, tol=0.03):
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

def ring_area(ring):
    area = 0.0
    n = len(ring)
    for i in range(n):
        j = (i + 1) % n
        area += ring[i][0] * ring[j][1]
        area -= ring[j][0] * ring[i][1]
    return abs(area) * 0.5

def project_conus(lon, lat):
    # Albers Equal-Area Conic for Lower 48 (North is UP in SVG)
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

def project_alaska(lon, lat):
    # Inset box for Alaska (scaled & rotated to fit lower-left box 20..225, 440..580)
    # Target center ~ (115, 510)
    phi1 = math.radians(55.0)
    phi2 = math.radians(65.0)
    phi0 = math.radians(60.0)
    lam0 = math.radians(-152.0)
    phi = math.radians(lat)
    lam = math.radians(lon)

    n = 0.5 * (math.sin(phi1) + math.sin(phi2))
    C = math.cos(phi1)**2 + 2 * n * math.sin(phi1)
    rho0 = math.sqrt(max(0.0, C - 2 * n * math.sin(phi0))) / n
    rho = math.sqrt(max(0.0, C - 2 * n * math.sin(phi))) / n
    theta = n * (lam - lam0)

    scale = 260.0
    x_raw = scale * rho * math.sin(theta)
    y_raw = -scale * (rho0 - rho * math.cos(theta))

    # rotate -30 deg for pleasing cartographic fit
    rot = math.radians(-30.0)
    xr = x_raw * math.cos(rot) - y_raw * math.sin(rot)
    yr = x_raw * math.sin(rot) + y_raw * math.cos(rot)

    x = 115.0 + xr
    y = 510.0 + yr
    return x, y

def project_hawaii(lon, lat):
    # Inset box for Hawaii (lower-left-center box 232..365, 490..580)
    # Target center ~ (295, 535)
    phi1 = math.radians(19.0)
    phi2 = math.radians(22.0)
    phi0 = math.radians(20.5)
    lam0 = math.radians(-157.0)
    phi = math.radians(lat)
    lam = math.radians(lon)

    n = 0.5 * (math.sin(phi1) + math.sin(phi2))
    C = math.cos(phi1)**2 + 2 * n * math.sin(phi1)
    rho0 = math.sqrt(max(0.0, C - 2 * n * math.sin(phi0))) / n
    rho = math.sqrt(max(0.0, C - 2 * n * math.sin(phi))) / n
    theta = n * (lam - lam0)

    scale = 800.0
    x_raw = scale * rho * math.sin(theta)
    y_raw = -scale * (rho0 - rho * math.cos(theta))

    x = 295.0 + x_raw
    y = 535.0 + y_raw
    return x, y

def project_coords(lon, lat, region_type):
    if region_type == 'alaska':
        return project_alaska(lon, lat)
    elif region_type == 'hawaii':
        return project_hawaii(lon, lat)
    else:
        return project_conus(lon, lat)

def geometry_to_svg_path(geom, region_type='conus', tol=0.03, min_area=0.005):
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
            if ring_idx == 0:
                area = ring_area(ring)
                if area < min_area:
                    continue
            s_ring = simplify_ring(ring, tol)
            if len(s_ring) < 3:
                continue
            ring_cmds = []
            for i, pt in enumerate(s_ring):
                px, py = project_coords(pt[0], pt[1], region_type)
                cmd = 'M' if i == 0 else 'L'
                ring_cmds.append(f"{cmd}{px:.1f},{py:.1f}")
            ring_cmds.append("Z")
            path_parts.append("".join(ring_cmds))

    return " ".join(path_parts)

def compute_centroid(geom, region_type='conus'):
    gtype = geom['type']
    coords = geom['coordinates']
    pts = []
    if gtype == 'Polygon':
        for ring in coords:
            pts.extend(ring)
    elif gtype == 'MultiPolygon':
        for poly in coords:
            for ring in poly:
                pts.extend(ring)
    if not pts:
        return 0, 0
    proj_pts = [project_coords(p[0], p[1], region_type) for p in pts[::max(1, len(pts)//100)]]
    avg_x = sum(p[0] for p in proj_pts) / len(proj_pts)
    avg_y = sum(p[1] for p in proj_pts) / len(proj_pts)
    return round(avg_x, 1), round(avg_y, 1)

def main():
    base_dir = '/Users/ybwdaisy/.gemini/antigravity/scratch/america-unfolded'
    raw_dir = os.path.join(base_dir, 'data/raw')
    out_dir = os.path.join(base_dir, 'data/processed')
    os.makedirs(out_dir, exist_ok=True)

    print("Reading acquisitions GeoJSON...")
    with open(os.path.join(raw_dir, 'us_territorial_acquisitions.geojson')) as f:
        acq_raw = json.load(f)

    territory_shapes = []
    for feat in acq_raw['features']:
        props = feat['properties']
        oid = props['OBJECTID']
        name = props['NAME']
        
        region_type = 'conus'
        if oid == 1:
            region_type = 'alaska'
        elif oid == 5:
            region_type = 'hawaii'
        elif oid in [12, 16]:
            continue

        tol = 0.04
        if oid == 1:
            tol = 0.08
        elif oid == 5:
            tol = 0.02

        svg_path = geometry_to_svg_path(feat['geometry'], region_type=region_type, tol=tol)
        cx, cy = compute_centroid(feat['geometry'], region_type=region_type)

        territory_shapes.append({
            'objectId': oid,
            'name': name,
            'regionType': region_type,
            'yearAcquired': props.get('Year_Acq'),
            'path': svg_path,
            'centroid': [cx, cy],
            'notes': props.get('Notes', '')
        })

    with open(os.path.join(out_dir, 'territory_shapes.json'), 'w') as f:
        json.dump(territory_shapes, f, indent=2)
    print(f"Processed {len(territory_shapes)} territory shapes.")

    print("Reading US States GeoJSON...")
    with open(os.path.join(raw_dir, 'us_states.geojson')) as f:
        states_raw = json.load(f)

    state_shapes = []
    for feat in states_raw['features']:
        st_id = feat['id']
        st_name = feat['properties']['name']
        region_type = 'conus'
        if st_id == 'AK':
            region_type = 'alaska'
        elif st_id == 'HI':
            region_type = 'hawaii'

        tol = 0.03
        if st_id == 'AK':
            tol = 0.08
        elif st_id == 'HI':
            tol = 0.02

        svg_path = geometry_to_svg_path(feat['geometry'], region_type=region_type, tol=tol)
        cx, cy = compute_centroid(feat['geometry'], region_type=region_type)

        state_shapes.append({
            'id': st_id,
            'name': st_name,
            'regionType': region_type,
            'path': svg_path,
            'centroid': [cx, cy]
        })

    with open(os.path.join(out_dir, 'state_shapes.json'), 'w') as f:
        json.dump(state_shapes, f, indent=2)
    print(f"Processed {len(state_shapes)} state boundary shapes.")

if __name__ == '__main__':
    main()
