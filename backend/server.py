from flask import Flask, request, jsonify
from flask_cors import CORS

from mininet.net import Mininet
from mininet.node import OVSSwitch
from mininet.log import setLogLevel

import time


app = Flask(__name__)
CORS(app)

# Current Mininet network
net = None


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "mininet": "ready"
    })


# --------------------------------------------------
# Start Mininet Network
# --------------------------------------------------

@app.route("/api/start", methods=["POST"])
def start_network():
    global net

    data = request.get_json()

    devices = data.get("devices", [])
    connections = data.get("connections", [])

    # Stop previous network if one exists
    if net is not None:
        net.stop()
        net = None

    setLogLevel("info")

    # Create Mininet
    net = Mininet(
        switch=OVSSwitch,
        controller=None
    )

    device_map = {}

    # ----------------------------------------------
    # Create devices
    # ----------------------------------------------

    for device in devices:

        device_type = device.get("type")
        device_id = device.get("id")

        # PCs and Servers become Mininet hosts
        if device_type in ["pc", "server"]:

            config = device.get("config", {})

            ip_address = config.get(
                "ip",
                "10.0.0.1"
            )

            host = net.addHost(
                device_id,
                ip=ip_address
            )

            device_map[device_id] = host

        # Switch becomes an Open vSwitch switch
        elif device_type == "switch":

            switch = net.addSwitch(
                device_id
            )

            device_map[device_id] = switch

    # ----------------------------------------------
    # Create connections
    # ----------------------------------------------

    for connection in connections:

        source = connection.get("source")
        target = connection.get("target")

        if source in device_map and target in device_map:

            net.addLink(
                device_map[source],
                device_map[target]
            )

    # ----------------------------------------------
    # Start network
    # ----------------------------------------------

    net.start()

    time.sleep(1)

    return jsonify({
        "status": "running",
        "devices": list(device_map.keys()),
        "connections": len(connections)
    })


# --------------------------------------------------
# Ping Test
# --------------------------------------------------

@app.route("/api/ping", methods=["POST"])
def ping():
    global net

    if net is None:
        return jsonify({
            "error": "Network is not running"
        }), 400

    data = request.get_json()

    source = data.get("source")
    target = data.get("target")

    # Check source
    if source not in net:
        return jsonify({
            "error": f"{source} not found"
        }), 404

    # Check target
    if target not in net:
        return jsonify({
            "error": f"{target} not found"
        }), 404

    target_ip = net[target].IP()

    # Run real ping inside Mininet
    result = net[source].cmd(
        f"ping -c 4 {target_ip}"
    )

    return jsonify({
        "source": source,
        "target": target,
        "target_ip": target_ip,
        "result": result
    })


# --------------------------------------------------
# Stop Mininet Network
# --------------------------------------------------

@app.route("/api/stop", methods=["POST"])
def stop_network():
    global net

    if net is not None:

        net.stop()
        net = None

    return jsonify({
        "status": "stopped"
    })


# --------------------------------------------------
# Run Flask Server
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
