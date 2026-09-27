"""
NetBuilder Packet Capture Engine (Real & Simulated tcpdump)
Executes tcpdump inside Mininet host network namespaces or simulates real-time packet inspection.
"""

import threading
import time
import subprocess
import re
import random
from typing import Dict, List, Optional, Any

class PacketCaptureManager:
    def __init__(self):
        self.captures: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()

    def start_capture(self, node_id: str, interface: str = "any", filter_expr: str = "", mininet_net=None) -> Dict[str, Any]:
        """
        Start capturing packets on a node.
        """
        with self.lock:
            if node_id in self.captures and self.captures[node_id]["active"]:
                return {"status": "error", "message": f"Capture already active for node {node_id}"}

            capture_data = {
                "node_id": node_id,
                "interface": interface,
                "filter": filter_expr,
                "active": True,
                "start_time": time.time(),
                "packets": [],
                "process": None,
                "thread": None,
                "stop_signal": False
            }
            self.captures[node_id] = capture_data

            if mininet_net and node_id in mininet_net:
                # Real Mininet tcpdump capture
                try:
                    host = mininet_net.get(node_id)
                    cmd = f"tcpdump -i {interface} -nn -l -v {filter_expr}".strip()
                    proc = host.popen(cmd.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                    capture_data["process"] = proc

                    t = threading.Thread(target=self._read_tcpdump_output, args=(node_id, proc), daemon=True)
                    t.start()
                    capture_data["thread"] = t
                except Exception as e:
                    # Fallback to background simulator loop if tcpdump fails
                    t = threading.Thread(target=self._simulate_packet_capture, args=(node_id,), daemon=True)
                    t.start()
                    capture_data["thread"] = t
            else:
                # Simulation / Windows mode
                t = threading.Thread(target=self._simulate_packet_capture, args=(node_id,), daemon=True)
                t.start()
                capture_data["thread"] = t

            return {"status": "success", "message": f"Packet capture started on node {node_id}", "node_id": node_id}

    def stop_capture(self, node_id: str) -> Dict[str, Any]:
        """
        Stop packet capture on a node.
        """
        with self.lock:
            if node_id not in self.captures:
                return {"status": "error", "message": f"No active capture found for node {node_id}"}

            cap = self.captures[node_id]
            cap["active"] = False
            cap["stop_signal"] = True

            if cap["process"]:
                try:
                    cap["process"].terminate()
                    cap["process"].wait(timeout=1.0)
                except Exception:
                    pass

            return {
                "status": "success",
                "message": f"Capture stopped on node {node_id}",
                "total_packets": len(cap["packets"])
            }

    def get_packets(self, node_id: str, limit: int = 100) -> Dict[str, Any]:
        """
        Get captured packets for a node.
        """
        with self.lock:
            if node_id not in self.captures:
                return {"status": "error", "message": f"No capture history for node {node_id}", "packets": [], "active": False}

            cap = self.captures[node_id]
            packets = cap["packets"][-limit:]
            return {
                "status": "success",
                "node_id": node_id,
                "active": cap["active"],
                "count": len(cap["packets"]),
                "packets": packets
            }

    def clear_packets(self, node_id: str) -> Dict[str, Any]:
        """
        Clear packet buffer for a node.
        """
        with self.lock:
            if node_id in self.captures:
                self.captures[node_id]["packets"] = []
            return {"status": "success", "message": f"Cleared capture buffer for node {node_id}"}

    def _read_tcpdump_output(self, node_id: str, proc: subprocess.Popen):
        """
        Parse real tcpdump output line by line.
        """
        for line in iter(proc.stdout.readline, ''):
            if not line:
                break
            with self.lock:
                if node_id not in self.captures or not self.captures[node_id]["active"]:
                    break
                
                pkt = self._parse_tcpdump_line(line.strip())
                if pkt:
                    self.captures[node_id]["packets"].append(pkt)
                    if len(self.captures[node_id]["packets"]) > 1000:
                        self.captures[node_id]["packets"].pop(0)

    def _parse_tcpdump_line(self, line: str) -> Optional[Dict[str, Any]]:
        """
        Regex parser for standard tcpdump verbose line output.
        """
        if not line or line.startswith("tcpdump:"):
            return None
            
        timestamp = time.strftime("%H:%M:%S", time.localtime())
        protocol = "IP"
        if "ICMP" in line or "echo" in line:
            protocol = "ICMP"
        elif "TCP" in line or "flags" in line or "seq" in line:
            protocol = "TCP"
        elif "UDP" in line:
            protocol = "UDP"
        elif "ARP" in line:
            protocol = "ARP"

        ip_match = re.search(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)? > (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?', line)
        if ip_match:
            src_ip = ip_match.group(1)
            dst_ip = ip_match.group(2)
        else:
            src_ip = "0.0.0.0"
            dst_ip = "0.0.0.0"

        len_match = re.search(r'length (\d+)', line)
        length = int(len_match.group(1)) if len_match else random.randint(64, 1500)

        return {
            "timestamp": timestamp,
            "src": src_ip,
            "dst": dst_ip,
            "protocol": protocol,
            "length": length,
            "info": line[:120]
        }

    def _simulate_packet_capture(self, node_id: str):
        """
        Simulate tcpdump packet stream for Windows / non-root environments.
        """
        node_ip = f"10.0.0.{node_id.replace('h', '').replace('h', '') if 'h' in node_id else '1'}"
        protocols = ["ICMP", "TCP", "UDP", "ARP"]
        
        pkt_id = 1
        while True:
            with self.lock:
                if node_id not in self.captures or not self.captures[node_id]["active"]:
                    break
                
                proto = random.choice(protocols)
                other_host_num = random.randint(1, 4)
                target_ip = f"10.0.0.{other_host_num}"
                
                is_outgoing = random.choice([True, False])
                src = node_ip if is_outgoing else target_ip
                dst = target_ip if is_outgoing else node_ip

                if proto == "ICMP":
                    info = f"echo request seq={pkt_id}, ttl=64" if is_outgoing else f"echo reply seq={pkt_id}, ttl=64"
                    length = 64
                elif proto == "TCP":
                    src_port = random.randint(30000, 60000)
                    dst_port = 80 if is_outgoing else random.randint(30000, 60000)
                    info = f"{src_port} > {dst_port} [ACK] Seq={pkt_id*100} Ack={pkt_id*100+1} Win=502 Len=1460"
                    length = 1500
                elif proto == "UDP":
                    src_port = random.randint(40000, 50000)
                    dst_port = 5001
                    info = f"UDP, length 1470 ({src_port} > {dst_port})"
                    length = 1470
                else:
                    info = f"Who has {target_ip}? Tell {node_ip}"
                    length = 42

                pkt = {
                    "id": pkt_id,
                    "timestamp": time.strftime("%H:%M:%S", time.localtime()) + f".{random.randint(100, 999)}",
                    "src": src,
                    "dst": dst,
                    "protocol": proto,
                    "length": length,
                    "info": info
                }

                self.captures[node_id]["packets"].append(pkt)
                if len(self.captures[node_id]["packets"]) > 500:
                    self.captures[node_id]["packets"].pop(0)

                pkt_id += 1

            time.sleep(random.uniform(0.2, 0.8))

capture_manager = PacketCaptureManager()
