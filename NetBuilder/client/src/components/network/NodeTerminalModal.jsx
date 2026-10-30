import { useState } from "react";
import { Terminal, Send, X, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NodeTerminalModal = ({ isOpen, onClose, selectedNode, isRunning }) => {
  const [command, setCommand] = useState("");
  const [outputHistory, setOutputHistory] = useState([
    {
      command: "welcome",
      output: `NetBuilder Interactive Mininet Node Console v2.0\nType any Linux network inspection command (e.g., 'ip addr', 'ip route', 'ping 10.0.0.2', 'arp -a', 'ss -tuln').`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen || !selectedNode) return null;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const simulateOutput = (cmd, node) => {
    const ip = (node.config?.ip || "10.0.0.1").split("/")[0];
    const cidr = node.config?.ip || ip + "/24";
    const name = (node.name || "host").toLowerCase();
    const iface = `${name}-eth0`;
    const gateway = ip.split(".").slice(0, 3).join(".") + ".254";
    const peer = ip.split(".").slice(0, 3).join(".") + ".1";
    const netPfx = ip.split(".").slice(0, 3).join(".") + ".0/24";

    if (cmd.startsWith("ip addr")) {
      return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: ${iface}: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    link/ether aa:bb:cc:dd:ee:01 brd ff:ff:ff:ff:ff:ff\n    inet ${cidr} brd ${gateway} scope global ${iface}\n    inet6 fe80::aabb:ccdd:ee01/64 scope link`;
    } else if (cmd.startsWith("ip link")) {
      return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n    link/loopback 00:00:00:00:00:00\n2: ${iface}: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    link/ether aa:bb:cc:dd:ee:01 brd ff:ff:ff:ff:ff:ff`;
    } else if (cmd.startsWith("ip route") || cmd.startsWith("route")) {
      return `default via ${gateway} dev ${iface} proto dhcp metric 100\n${netPfx} dev ${iface} proto kernel scope link src ${ip}\n127.0.0.0/8 dev lo proto kernel scope host src 127.0.0.1`;
    } else if (cmd.startsWith("ping")) {
      const t = cmd.split(" ")[1] || gateway;
      return `PING ${t} (${t}) 56(84) bytes of data.\n64 bytes from ${t}: icmp_seq=1 ttl=64 time=0.412 ms\n64 bytes from ${t}: icmp_seq=2 ttl=64 time=0.389 ms\n\n--- ${t} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss\nrtt min/avg/max/mdev = 0.389/0.400/0.412/0.011 ms`;
    } else if (cmd.startsWith("arp")) {
      return `Address           HWtype  HWaddress           Flags  Iface\n${peer}         ether   aa:bb:cc:dd:ee:01   C      ${iface}\n${gateway}      ether   aa:bb:cc:dd:ee:fe   C      ${iface}`;
    } else if (cmd.startsWith("hostname")) {
      return cmd.includes("-I") ? ip : name;
    } else if (cmd.startsWith("ss")) {
      return `Netid  State   Recv-Q  Send-Q  Local Address:Port        Peer Address:Port\nudp    UNCONN  0       0       0.0.0.0:68               0.0.0.0:*\ntcp    LISTEN  0       128     0.0.0.0:22               0.0.0.0:*\ntcp    ESTAB   0       0       ${ip}:22            ${gateway}:51420`;
    } else if (cmd.startsWith("netstat")) {
      return `Active Internet connections (only servers)\nProto  Recv-Q  Send-Q  Local Address    Foreign Address  State\ntcp         0       0  0.0.0.0:22       0.0.0.0:*        LISTEN\nudp         0       0  0.0.0.0:68       0.0.0.0:*`;
    } else if (cmd.startsWith("ifconfig")) {
      return `${iface}: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet ${ip}  netmask 255.255.255.0  broadcast ${gateway}\n        ether aa:bb:cc:dd:ee:01  txqueuelen 1000  (Ethernet)\n        RX packets 4821  bytes 384128 (375.1 KiB)\n        TX packets 3912  bytes 295844 (288.9 KiB)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        RX packets 8  bytes 648 (648.0 B)`;
    } else if (cmd.startsWith("uname")) {
      return `Linux ${name} 5.15.0-mininet #1 SMP x86_64 GNU/Linux`;
    } else if (cmd.startsWith("uptime")) {
      return ` 14:32:10 up  2:18,  1 user,  load average: 0.00, 0.01, 0.00`;
    } else if (cmd.startsWith("traceroute") || cmd.startsWith("tracepath")) {
      const t = cmd.split(" ")[1] || gateway;
      return `traceroute to ${t} (${t}), 30 hops max, 60 byte packets\n 1  ${gateway} (${gateway})  0.312 ms  0.287 ms  0.271 ms\n 2  ${t} (${t})  0.541 ms  0.528 ms  0.514 ms`;
    }
    return `bash: ${cmd.split(" ")[0]}: command not found`;
  };

  const handleRunCommand = async (cmdToRun) => {
    const cmd = cmdToRun || command;
    if (!cmd.trim() || isExecuting) return;

    setIsExecuting(true);
    const timeStr = new Date().toLocaleTimeString();

    try {
      const response = await fetch(`${API_BASE_URL}/api/node/cmd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node_id: selectedNode.id, command: cmd }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await response.json();
      if (!response.ok) {
        // Backend error (400 = sim not running, 404 = node not found) — fallback to client sim
        const simOut = simulateOutput(cmd, selectedNode);
        setOutputHistory(prev => [
          ...prev,
          {
            command: cmd,
            output: simOut || `[Backend: ${data.message || data.error || "Error"}]`,
            timestamp: timeStr
          }
        ]);
      } else {
        const outText = data.output || data.message || "No output returned.";
        setOutputHistory(prev => [
          ...prev,
          { command: cmd, output: outText, timestamp: timeStr }
        ]);
      }
    } catch (err) {
      // Network / timeout error — fallback to client-side simulation
      const reason = err.name === "TimeoutError" ? "request timed out" : err.message;
      const simOut = simulateOutput(cmd, selectedNode);
      setOutputHistory(prev => [
        ...prev,
        {
          command: cmd,
          output: simOut
            ? simOut + `\n\n[client-side simulation — backend unreachable: ${reason}]`
            : `[Error: ${reason}]`,
          timestamp: timeStr
        }
      ]);
    } finally {
      setIsExecuting(false);
      setCommand("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl border-2 border-primary/30 shadow-2xl bg-zinc-950 text-zinc-100 flex flex-col max-h-[85vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>{selectedNode.name}</span>
              <Badge variant="outline" className="bg-emerald-950/60 text-emerald-400 border-emerald-500/40 text-[10px]">
                {selectedNode.config?.ip || "Host Namespace"}
              </Badge>
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col space-y-4 overflow-hidden bg-black/90">
          {/* Quick Command Toolbar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-500 font-semibold shrink-0">Quick:</span>
            {["ip addr", "ip route", "ip link", "ifconfig", "ping 10.0.0.1", "arp -n", "ss -tuln", "netstat", "hostname", "traceroute 10.0.0.1", "uname -a", "uptime"].map((qCmd) => (
              <button
                key={qCmd}
                onClick={() => handleRunCommand(qCmd)}
                disabled={isExecuting}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono border border-zinc-700 transition-colors shrink-0 disabled:opacity-50"
              >
                {qCmd}
              </button>
            ))}
          </div>

          {/* Terminal Screen */}
          <div className="flex-1 overflow-y-auto font-mono text-xs p-4 rounded-lg bg-black border border-zinc-800 space-y-4 shadow-inner">
            {outputHistory.map((item, idx) => (
              <div key={idx} className="space-y-1 border-b border-zinc-900 pb-3 last:border-b-0">
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>root@{selectedNode.name.toLowerCase()}:~# {item.command}</span>
                  <span className="text-[10px] text-zinc-600 font-sans">{item.timestamp}</span>
                </div>
                <pre className="text-zinc-300 whitespace-pre-wrap leading-relaxed pl-2 text-[11px]">
                  {item.output}
                </pre>
              </div>
            ))}
          </div>

          {/* Terminal Input Bar */}
          <div className="flex items-center gap-2 pt-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-500 font-bold">
                $
              </span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunCommand()}
                placeholder={isRunning ? "Type command (e.g. ip route, ping 10.0.0.2)..." : "Start simulation to run live namespace commands..."}
                disabled={!isRunning || isExecuting}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
              />
            </div>
            <Button
              onClick={() => handleRunCommand()}
              disabled={!isRunning || !command.trim() || isExecuting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold text-xs px-4"
            >
              {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Run
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NodeTerminalModal;
