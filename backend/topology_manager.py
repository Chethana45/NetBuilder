import re
from collections import deque

VALID_DEVICE_TYPES = {"pc", "server", "switch", "router", "hub", "firewall"}
IP_REGEX = re.compile(r"^(\d{1,3}\.){3}\d{1,3}(/\d{1,2})?$")


def is_valid_ip(ip_str):
    if not ip_str or not isinstance(ip_str, str):
        return False
    if not IP_REGEX.match(ip_str.strip()):
        return False
    clean_ip = ip_str.split("/")[0]
    parts = clean_ip.split(".")
    return all(0 <= int(p) <= 255 for p in parts)


def sanitize_ip(ip_str, default_suffix="/24"):
    if not ip_str:
        return ""
    ip_str = ip_str.strip()
    if "/" not in ip_str:
        return f"{ip_str}{default_suffix}"
    return ip_str


def validate_topology(devices, connections):
    """
    Validates network topology before starting Mininet.
    Returns (is_valid: bool, error_message: str, details: dict).
    """
    if not isinstance(devices, list) or len(devices) == 0:
        return False, "Topology must contain at least one device.", {}

    if not isinstance(connections, list):
        return False, "Connections must be a valid list.", {}

    seen_ids = set()
    seen_names = set()
    seen_ips = set()
    device_dict = {}

    for d in devices:
        dev_id = d.get("id")
        dev_name = d.get("name") or dev_id
        dev_type = (d.get("type") or "").lower()

        if not dev_id:
            return False, "Device missing unique ID.", {}

        if dev_id in seen_ids:
            return False, f"Duplicate device ID found: '{dev_id}'.", {}
        seen_ids.add(dev_id)

        if dev_name in seen_names:
            return False, f"Duplicate device name found: '{dev_name}'.", {}
        seen_names.add(dev_name)

        if dev_type not in VALID_DEVICE_TYPES:
            return False, f"Device '{dev_name}' has unsupported type '{dev_type}'.", {}

        config = d.get("config", {}) or {}
        ip_addr = config.get("ip", "").strip()

        if ip_addr:
            if not is_valid_ip(ip_addr):
                return False, f"Device '{dev_name}' has invalid IP address format: '{ip_addr}'.", {}
            clean_ip = ip_addr.split("/")[0]
            if clean_ip in seen_ips:
                return False, f"Duplicate IP address: '{clean_ip}' assigned to '{dev_name}'.", {}
            seen_ips.add(clean_ip)

        device_dict[dev_id] = d

    # Validate connections
    seen_pairs = set()
    connected_device_ids = set()

    for conn in connections:
        source = conn.get("source")
        target = conn.get("target")

        if not source or not target:
            return False, "Connection has missing source or target.", {}

        if source not in device_dict:
            return False, f"Connection references nonexistent source device ID '{source}'.", {}

        if target not in device_dict:
            return False, f"Connection references nonexistent target device ID '{target}'.", {}

        if source == target:
            src_name = device_dict[source].get("name", source)
            return False, f"Self-connection detected on device '{src_name}'.", {}

        pair = tuple(sorted([source, target]))
        if pair in seen_pairs:
            src_name = device_dict[source].get("name", source)
            tgt_name = device_dict[target].get("name", target)
            return False, f"Duplicate connection between '{src_name}' and '{tgt_name}'.", {}
        seen_pairs.add(pair)

        connected_device_ids.add(source)
        connected_device_ids.add(target)

    # Check for disconnected devices if total devices > 1
    if len(devices) > 1:
        disconnected = [
            d.get("name", d.get("id")) for d in devices if d.get("id") not in connected_device_ids
        ]
        if disconnected:
            return False, f"Disconnected device(s) found: {', '.join(disconnected)}. All devices must be connected.", {}

    return True, "", {
        "device_count": len(devices),
        "connection_count": len(connections),
    }


def generate_mininet_mapping(devices):
    """
    Creates a mapping between frontend IDs/names and Mininet node names (h1, s1, r1, etc.).
    Returns (mapping: dict, mininet_nodes: list).
    """
    host_counter = 1
    switch_counter = 1
    router_counter = 1

    mapping = {}  # frontend_id -> mininet_name
    reverse_mapping = {}  # mininet_name -> frontend_id
    nodes_info = []

    ip_counter = 1

    for d in devices:
        dev_id = d.get("id")
        dev_name = d.get("name", dev_id)
        dev_type = (d.get("type") or "pc").lower()
        config = d.get("config", {}) or {}

        user_ip = config.get("ip", "").strip()

        if dev_type in ["pc", "server"]:
            mn_name = f"h{host_counter}"
            host_counter += 1
            node_kind = "host"

            if not user_ip:
                assigned_ip = f"10.0.0.{ip_counter}/24"
                ip_counter += 1
            else:
                assigned_ip = sanitize_ip(user_ip, "/24")

            gateway = config.get("gateway", "").strip()

        elif dev_type in ["switch", "hub"]:
            mn_name = f"s{switch_counter}"
            switch_counter += 1
            node_kind = "switch"
            assigned_ip = ""
            gateway = ""

        elif dev_type in ["router", "firewall"]:
            mn_name = f"r{router_counter}"
            router_counter += 1
            node_kind = "router"

            if not user_ip:
                assigned_ip = f"10.0.{ip_counter}.1/24"
                ip_counter += 1
            else:
                assigned_ip = sanitize_ip(user_ip, "/24")

            gateway = ""

        else:
            mn_name = f"h{host_counter}"
            host_counter += 1
            node_kind = "host"
            assigned_ip = f"10.0.0.{ip_counter}/24"
            ip_counter += 1
            gateway = ""

        mapping[dev_id] = mn_name
        reverse_mapping[mn_name] = dev_id

        nodes_info.append({
            "frontend_id": dev_id,
            "frontend_name": dev_name,
            "mininet_name": mn_name,
            "type": dev_type,
            "kind": node_kind,
            "ip": assigned_ip,
            "gateway": gateway,
        })

    return mapping, reverse_mapping, nodes_info


def find_path_in_topology(source_id, target_id, connections):
    """
    Finds the shortest path between source_id and target_id using BFS.
    Returns list of device IDs along path or empty list if no path.
    """
    adj = {}
    for conn in connections:
        src = conn.get("source")
        tgt = conn.get("target")
        if src and tgt:
            adj.setdefault(src, []).append(tgt)
            adj.setdefault(tgt, []).append(src)

    if source_id not in adj or target_id not in adj:
        if source_id == target_id:
            return [source_id]
        return []

    queue = deque([[source_id]])
    visited = {source_id}

    while queue:
        path = queue.popleft()
        current = path[-1]

        if current == target_id:
            return path

        for neighbor in adj.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(path + [neighbor])

    return []
