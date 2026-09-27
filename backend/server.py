import os
import sys

# Ensure project root is in Python path regardless of execution directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

from backend.mininet_manager import MininetManager
from backend.topology_manager import validate_topology, find_path_in_topology
from backend.stats_manager import get_real_statistics, get_openflow_flows
from backend.experiment_manager import experiment_manager
from backend.capture_manager import capture_manager

app = Flask(__name__)
CORS(app)

# Initialize Mininet Manager singleton
manager = MininetManager()

logger = logging.getLogger("NetBuilder.Server")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")



# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify(manager.check_environment())


# --------------------------------------------------
# Start Simulation
# --------------------------------------------------

@app.route("/api/start", methods=["POST"])
def start_network():
    data = request.get_json() or {}
    devices = data.get("devices", [])
    connections = data.get("connections", [])

    res, status_code = manager.start_network(devices, connections)
    return jsonify(res), status_code


# --------------------------------------------------
# Stop Simulation
# --------------------------------------------------

@app.route("/api/stop", methods=["POST"])
def stop_network():
    res = manager.stop_network()
    return jsonify(res)


# --------------------------------------------------
# Reset / Cleanup
# --------------------------------------------------

@app.route("/api/reset", methods=["POST"])
def reset_network():
    res = manager.reset_network()
    return jsonify(res)


# --------------------------------------------------
# Real Ping Test
# --------------------------------------------------

@app.route("/api/ping", methods=["POST"])
def ping():
    data = request.get_json() or {}
    source = data.get("source") or data.get("node1")
    target = data.get("target") or data.get("node2")

    if not source or not target:
        return jsonify({"error": "Both 'source' and 'target' must be specified."}), 400

    res, status_code = manager.ping(source, target)
    return jsonify(res), status_code


# --------------------------------------------------
# Real Iperf Bandwidth Test
# --------------------------------------------------

@app.route("/api/iperf", methods=["POST"])
def iperf():
    data = request.get_json() or {}
    source = data.get("source") or data.get("node1")
    target = data.get("target") or data.get("node2")
    duration = int(data.get("duration", 5))

    if not source or not target:
        return jsonify({"error": "Both 'source' and 'target' must be specified."}), 400

    res, status_code = manager.iperf(source, target, duration)
    return jsonify(res), status_code


# --------------------------------------------------
# Real Traffic Generator
# --------------------------------------------------

@app.route("/api/traffic", methods=["POST"])
def traffic():
    data = request.get_json() or {}
    source = data.get("source") or data.get("node1")
    target = data.get("target") or data.get("node2")
    protocol = data.get("protocol", "TCP")
    duration = int(data.get("duration", 5))

    if not source or not target:
        return jsonify({"error": "Both 'source' and 'target' must be specified."}), 400

    res, status_code = manager.traffic(source, target, protocol, duration)
    return jsonify(res), status_code


# --------------------------------------------------
# Link Failure Simulation (Down/Up)
# --------------------------------------------------

@app.route("/api/link/down", methods=["POST"])
def link_down():
    data = request.get_json() or {}
    source = data.get("source") or data.get("node1")
    target = data.get("target") or data.get("node2")

    if not source or not target:
        return jsonify({"error": "Both 'source'/'node1' and 'target'/'node2' must be specified."}), 400

    res, status_code = manager.set_link_status(source, target, "down")
    return jsonify(res), status_code


@app.route("/api/link/up", methods=["POST"])
def link_up():
    data = request.get_json() or {}
    source = data.get("source") or data.get("node1")
    target = data.get("target") or data.get("node2")

    if not source or not target:
        return jsonify({"error": "Both 'source'/'node1' and 'target'/'node2' must be specified."}), 400

    res, status_code = manager.set_link_status(source, target, "up")
    return jsonify(res), status_code


# --------------------------------------------------
# Topology Status
# --------------------------------------------------

@app.route("/api/topology", methods=["GET"])
def get_topology():
    if not manager.is_running or not manager.raw_topology:
        return jsonify({"error": "Mininet network is not running"}), 400

    devices = manager.raw_topology.get("devices", [])
    connections = manager.raw_topology.get("connections", [])
    nodes_info = manager.nodes_info

    hosts = [n for n in nodes_info if n["kind"] == "host"]
    switches = [n for n in nodes_info if n["kind"] == "switch"]
    routers = [n for n in nodes_info if n["kind"] == "router"]

    return jsonify({
        "status": "running",
        "devices": devices,
        "connections": connections,
        "nodes": nodes_info,
        "mapping": manager.mapping,
        "counts": {
            "hosts": len(hosts),
            "switches": len(switches),
            "routers": len(routers),
            "links": len(connections),
            "devices": len(devices),
        },
    })


# --------------------------------------------------
# Real Statistics (Host + Switch Ports)
# --------------------------------------------------

@app.route("/api/stats", methods=["GET"])
def get_stats():
    res, status_code = get_real_statistics(manager)
    return jsonify(res), status_code


# --------------------------------------------------
# OpenFlow Flow Tables
# --------------------------------------------------

@app.route("/api/flows", methods=["GET"])
def get_flows():
    res, status_code = get_openflow_flows(manager)
    return jsonify(res), status_code


# --------------------------------------------------
# Path Discovery
# --------------------------------------------------

@app.route("/api/path", methods=["POST"])
def get_path():
    data = request.get_json() or {}
    source = data.get("source") or data.get("node1")
    target = data.get("target") or data.get("node2")

    if not manager.raw_topology:
        return jsonify({"error": "Simulation is not running"}), 400

    path = find_path_in_topology(source, target, manager.raw_topology.get("connections", []))
    return jsonify({
        "status": "success",
        "source": source,
        "target": target,
        "path": path
    }), 200


# --------------------------------------------------
# Advanced Experimentation Endpoints
# --------------------------------------------------


@app.route("/api/experiments/start", methods=["POST"])
def start_experiment():
    data = request.get_json() or {}
    res, status_code = experiment_manager.start_experiment(data, manager.net, manager.mapping, manager.nodes_info)
    return jsonify(res), status_code

@app.route("/api/experiments/stop", methods=["POST"])
def stop_experiment():
    res, status_code = experiment_manager.stop_experiment()
    return jsonify(res), status_code

@app.route("/api/experiments/active", methods=["GET"])
def active_experiment():
    res, status_code = experiment_manager.get_active_metrics()
    return jsonify(res), status_code

@app.route("/api/experiments/history", methods=["GET"])
def experiment_history():
    res, status_code = experiment_manager.get_history()
    return jsonify(res), status_code

# --------------------------------------------------
# Link Network Conditions (TC) Configuration
# --------------------------------------------------

@app.route("/api/link/config", methods=["POST"])
def config_link_tc():
    data = request.get_json() or {}
    source = data.get("source") or data.get("node1")
    target = data.get("target") or data.get("node2")
    bw = data.get("bw")
    delay = data.get("delay")
    loss = data.get("loss")
    max_queue_size = data.get("max_queue_size") or data.get("queue")

    if not source or not target:
        return jsonify({"error": "Both 'source' and 'target' must be specified."}), 400

    res, status_code = manager.configure_link_tc(source, target, bw, delay, loss, max_queue_size)
    return jsonify(res), status_code

# --------------------------------------------------
# Packet Capture Engine (tcpdump / Inspector)
# --------------------------------------------------

@app.route("/api/capture/start", methods=["POST"])
def start_capture():
    data = request.get_json() or {}
    node_id = data.get("node_id") or data.get("node")
    interface = data.get("interface", "any")
    filter_expr = data.get("filter", "")

    if not node_id:
        return jsonify({"error": "Target node_id must be specified."}), 400

    res = capture_manager.start_capture(node_id, interface, filter_expr, manager.net)
    return jsonify(res), 200

@app.route("/api/capture/stop", methods=["POST"])
def stop_capture():
    data = request.get_json() or {}
    node_id = data.get("node_id") or data.get("node")

    if not node_id:
        return jsonify({"error": "Target node_id must be specified."}), 400

    res = capture_manager.stop_capture(node_id)
    return jsonify(res), 200

@app.route("/api/capture/packets", methods=["GET"])
def get_captured_packets():
    node_id = request.args.get("node_id") or request.args.get("node")
    limit = int(request.args.get("limit", 100))

    if not node_id:
        return jsonify({"error": "Query parameter 'node_id' must be specified."}), 400

    res = capture_manager.get_packets(node_id, limit)
    return jsonify(res), 200

@app.route("/api/capture/clear", methods=["POST"])
def clear_captured_packets():
    data = request.get_json() or {}
    node_id = data.get("node_id") or data.get("node")

    if not node_id:
        return jsonify({"error": "Target node_id must be specified."}), 400

    res = capture_manager.clear_packets(node_id)
    return jsonify(res), 200

# --------------------------------------------------
# Traceroute & Routing Table Inspection
# --------------------------------------------------

@app.route("/api/traceroute", methods=["POST"])
def run_traceroute():
    data = request.get_json() or {}
    source = data.get("source") or data.get("node1")
    target = data.get("target") or data.get("node2")

    if not source or not target:
        return jsonify({"error": "Both 'source' and 'target' must be specified."}), 400

    res, status_code = manager.traceroute(source, target)
    return jsonify(res), status_code

@app.route("/api/router/routes", methods=["GET"])
def get_router_routes():
    node_id = request.args.get("node_id") or request.args.get("node")

    if not node_id:
        return jsonify({"error": "Query parameter 'node_id' must be specified."}), 400

    res, status_code = manager.get_routing_table(node_id)
    return jsonify(res), status_code


if __name__ == "__main__":

    logger.info("Starting NetBuilder Flask Server on port 5000...")
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
