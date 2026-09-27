import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Activity,
  Network,
  AlertTriangle,
  ArrowRight,
  FileText,
  Gauge,
  Sliders,
  Eye,
  History,
  TrendingUp,
  Workflow,
  Router,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SimulationControls = ({
  devices = [],
  connections = [],
  isRunning = false,
  simulationSpeed = 1,
  onSpeedChange,
  healthInfo = { status: "checking" },
  realStats = { hosts: [], switches: [] },
  realPingResult = null,
  realIperfResult = null,
  onRealPing,
  onRealIperf,
  toggleLinkStatus,
  openflowFlows = [],
  fetchOpenFlows,
  registeredTopology = null,
  eventLog = [],
  // Phase 2 props
  activeExperiment = null,
  experimentHistory = [],
  startExperiment,
  stopExperiment,
  configureLinkTC,
  startPacketCapture,
  stopPacketCapture,
  fetchCapturedPackets,
  capturedPackets = {},
  captureActive = {},
  runTraceroute,
  tracerouteResult = null,
  fetchRoutingTable,
  routingTableResult = null,
}) => {
  // Tabs State
  const [activeTab, setActiveTab] = useState("links");

  // Ping state
  const [pingSource, setPingSource] = useState("");
  const [pingTarget, setPingTarget] = useState("");

  // Iperf state
  const [iperfSource, setIperfSource] = useState("");
  const [iperfTarget, setIperfTarget] = useState("");
  const [iperfDuration, setIperfDuration] = useState(5);

  // Traffic Generator State
  const [expMode, setExpMode] = useState("fixed_data");
  const [expSrc, setExpSrc] = useState("");
  const [expDst, setExpDst] = useState("");
  const [expProto, setExpProto] = useState("TCP");
  const [expDataSize, setExpDataSize] = useState(50);
  const [expPacketCount, setExpPacketCount] = useState(1000);
  const [expPacketSize, setExpPacketSize] = useState(1400);
  const [expRateMbps, setExpRateMbps] = useState(10);
  const [expPps, setExpPps] = useState(500);
  const [expDuration, setExpDuration] = useState(10);
  const [expStreams, setExpStreams] = useState(1);
  const [expDirection, setExpDirection] = useState("unidirectional");

  // Link Network Conditions State
  const [tcLink, setTcLink] = useState("");
  const [tcBw, setTcBw] = useState(10);
  const [tcDelay, setTcDelay] = useState(5);
  const [tcLoss, setTcLoss] = useState(0);
  const [tcQueue, setTcQueue] = useState(100);

  // Packet Capture State
  const [captureNode, setCaptureNode] = useState("");
  const [captureFilter, setCaptureFilter] = useState("");

  // Traceroute & Routing State
  const [traceSrc, setTraceSrc] = useState("");
  const [traceDst, setTraceDst] = useState("");
  const [routeNode, setRouteNode] = useState("");

  // Flow table toggle
  const [showFlows, setShowFlows] = useState(false);

  // Filter hosts & servers for dropdowns
  const pingableDevices = devices.filter(
    (d) => d.type === "pc" || d.type === "server" || d.type === "router"
  );
  const routerOrHostDevices = devices.filter(
    (d) => d.type === "pc" || d.type === "server" || d.type === "router"
  );

  const defaultSource = pingSource || (pingableDevices[0]?.id || "");
  const defaultTarget = pingTarget || (pingableDevices[1]?.id || pingableDevices[0]?.id || "");

  // Auto-set default dropdown choices
  useEffect(() => {
    if (!expSrc && pingableDevices.length > 0) setExpSrc(pingableDevices[0].id);
    if (!expDst && pingableDevices.length > 1) setExpDst(pingableDevices[1].id);
    if (!captureNode && devices.length > 0) setCaptureNode(devices[0].id);
    if (!traceSrc && pingableDevices.length > 0) setTraceSrc(pingableDevices[0].id);
    if (!traceDst && pingableDevices.length > 1) setTraceDst(pingableDevices[1].id);
    if (!routeNode && routerOrHostDevices.length > 0) setRouteNode(routerOrHostDevices[0].id);
  }, [devices, pingableDevices, routerOrHostDevices]);

  // Poll captured packets if capture is active
  useEffect(() => {
    if (captureNode && captureActive[captureNode]) {
      const interval = setInterval(() => {
        fetchCapturedPackets?.(captureNode);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [captureNode, captureActive, fetchCapturedPackets]);

  const handlePingExecute = () => {
    const src = pingSource || defaultSource;
    const tgt = pingTarget || defaultTarget;
    if (src && tgt) onRealPing?.(src, tgt);
  };

  const handleIperfExecute = () => {
    const src = iperfSource || defaultSource;
    const tgt = iperfTarget || defaultTarget;
    if (src && tgt) onRealIperf?.(src, tgt, iperfDuration);
  };

  const handleStartExperiment = () => {
    const src = expSrc || defaultSource;
    const dst = expDst || defaultTarget;
    if (!src || !dst) return;

    startExperiment?.({
      mode: expMode,
      src,
      dst,
      protocol: expProto,
      data_size_mb: Number(expDataSize),
      packet_count: Number(expPacketCount),
      packet_size_bytes: Number(expPacketSize),
      rate_mbps: Number(expRateMbps),
      pps: Number(expPps),
      duration: Number(expDuration),
      parallel_streams: Number(expStreams),
      direction: expDirection,
    });
  };

  const handleApplyTc = () => {
    if (!tcLink) return;
    const [source, target] = tcLink.split("|");
    if (source && target) {
      configureLinkTC?.(source, target, tcBw, tcDelay, tcLoss, tcQueue);
    }
  };

  const handleToggleCapture = () => {
    if (!captureNode) return;
    if (captureActive[captureNode]) {
      stopPacketCapture?.(captureNode);
    } else {
      startPacketCapture?.(captureNode, captureFilter);
    }
  };

  const handleRunTraceroute = () => {
    const src = traceSrc || defaultSource;
    const dst = traceDst || defaultTarget;
    if (src && dst) {
      runTraceroute?.(src, dst);
    }
  };

  const handleFetchRoutes = () => {
    if (routeNode) {
      fetchRoutingTable?.(routeNode);
    }
  };

  const hostList = Array.isArray(realStats) ? realStats : realStats.hosts || [];
  const switchList = realStats.switches || [];

  const totalRxPackets = hostList.reduce((sum, h) => sum + Number(h.rx_packets || 0), 0);
  const totalTxPackets = hostList.reduce((sum, h) => sum + Number(h.tx_packets || 0), 0);
  const totalRxBytes = hostList.reduce((sum, h) => sum + Number(h.rx_bytes || 0), 0);
  const totalTxBytes = hostList.reduce((sum, h) => sum + Number(h.tx_bytes || 0), 0);

  const activeLinkCount = connections.filter((c) => c.status !== "disabled").length;
  const failedLinkCount = connections.filter((c) => c.status === "disabled").length;

  const isRealBackend = healthInfo?.mininet || healthInfo?.real_mininet_active;

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto bg-background text-foreground">
      {/* Top Statistics & Backend Engine Status Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1">
          <Card className="p-3 text-center border-blue-500/20 bg-card/80 shadow-sm">
            <div className="text-xl font-extrabold text-blue-500">
              {devices.filter((d) => d.type === "pc" || d.type === "server").length}
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Hosts</div>
          </Card>
          <Card className="p-3 text-center border-green-500/20 bg-card/80 shadow-sm">
            <div className="text-xl font-extrabold text-green-500">
              {devices.filter((d) => d.type === "switch").length}
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Switches</div>
          </Card>
          <Card className="p-3 text-center border-purple-500/20 bg-card/80 shadow-sm">
            <div className="text-xl font-extrabold text-purple-500">
              {devices.filter((d) => d.type === "router").length}
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Routers</div>
          </Card>
          <Card className="p-3 text-center bg-card/80 shadow-sm">
            <div className="text-xl font-extrabold text-foreground">{connections.length}</div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Total Links</div>
          </Card>
          <Card className="p-3 text-center border-emerald-500/20 bg-card/80 shadow-sm">
            <div className="text-xl font-extrabold text-emerald-500">{activeLinkCount}</div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Active Links</div>
          </Card>
          <Card className="p-3 text-center border-red-500/20 bg-card/80 shadow-sm">
            <div className="text-xl font-extrabold text-red-500">{failedLinkCount}</div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Failed Links</div>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
        <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full bg-muted/80 p-1 rounded-lg border">
          <TabsTrigger value="links" className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Link Failures & Links</span>
          </TabsTrigger>
          <TabsTrigger value="ping_iperf" className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span>Ping & Bandwidth</span>
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Traffic Generator</span>
          </TabsTrigger>
          <TabsTrigger value="tc" className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2">
            <Sliders className="w-4 h-4 text-orange-500" />
            <span>Link Conditions (TC)</span>
          </TabsTrigger>
          <TabsTrigger value="capture" className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2">
            <Eye className="w-4 h-4 text-cyan-500" />
            <span>Packet Inspector</span>
          </TabsTrigger>
          <TabsTrigger value="traceroute" className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2">
            <Workflow className="w-4 h-4 text-purple-500" />
            <span>Traceroute & Routes</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2">
            <History className="w-4 h-4 text-indigo-500" />
            <span>Flows & History</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Link Failure Detection & Control + Real Packet Counters */}
        <TabsContent value="links" className="space-y-6">
          <Card className="border-2 border-amber-500/30 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-lg">Link Failure Simulation & Fault Detection</span>
                </div>
                <Badge variant={failedLinkCount > 0 ? "destructive" : "default"} className="px-2.5 py-1 text-xs">
                  {failedLinkCount > 0 ? `${failedLinkCount} Link(s) Cut` : "All Links Healthy"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Cut physical links in real-time to simulate link outages. Test Ping and observing path rerouting or packet drop!
              </p>

              {connections.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6 border rounded-lg bg-muted/20">
                  No topology links created yet. Add connections on the Design Canvas to enable link failure testing.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map((conn) => {
                    const src = devices.find((d) => d.id === conn.source);
                    const tgt = devices.find((d) => d.id === conn.target);
                    const isDisabled = conn.status === "disabled";

                    return (
                      <div
                        key={conn.id}
                        className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                          isDisabled ? "bg-red-500/10 border-red-500/40 shadow-inner" : "bg-card border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <span>{src?.name || conn.source}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{tgt?.name || conn.target}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isDisabled ? "destructive" : "outline"} className="text-[10px] px-1.5 py-0.5">
                              {isDisabled ? "LINK FAILED (DOWN)" : "LINK ACTIVE (UP)"}
                            </Badge>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={isDisabled ? "default" : "destructive"}
                          onClick={() => toggleLinkStatus?.(conn.source, conn.target, !isDisabled)}
                          disabled={!isRunning}
                          className="text-xs h-9 px-4 font-semibold shadow-sm"
                        >
                          {isDisabled ? "Re-enable Link" : "Cut / Disable Link"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real Packet Counters Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-500" />
                  <span className="font-bold">Real Network Interface Packet Statistics</span>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="text-green-500">RX: {totalRxPackets} pkts ({totalRxBytes} B)</span>
                  <span className="text-blue-500">TX: {totalTxPackets} pkts ({totalTxBytes} B)</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {hostList.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6 border rounded-lg bg-muted/20">
                  Start simulation to monitor live interface statistics.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/60 font-semibold text-muted-foreground">
                        <th className="p-3">Device Name</th>
                        <th className="p-3">Interface</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">RX Packets</th>
                        <th className="p-3">TX Packets</th>
                        <th className="p-3">RX Bytes</th>
                        <th className="p-3">TX Bytes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hostList.map((h, i) => (
                        <tr key={i} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-semibold">{h.name}</td>
                          <td className="p-3 font-mono text-muted-foreground">{h.interface}</td>
                          <td className="p-3">{h.ip}</td>
                          <td className="p-3 text-green-500 font-bold">{h.rx_packets}</td>
                          <td className="p-3 text-blue-500 font-bold">{h.tx_packets}</td>
                          <td className="p-3">{h.rx_bytes} B</td>
                          <td className="p-3">{h.tx_bytes} B</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Ping & Bandwidth (Iperf) Testing */}
        <TabsContent value="ping_iperf" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ping Test Widget */}
            <Card className="p-5 border-2 border-blue-500/30 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-base">Network Ping Test</h3>
                  </div>
                  <Badge variant={isRunning ? "default" : "secondary"}>
                    {isRunning ? "Simulation Online" : "Simulation Stopped"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Source Host</label>
                    <select
                      value={pingSource || defaultSource}
                      onChange={(e) => setPingSource(e.target.value)}
                      className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-blue-500"
                      disabled={!isRunning}
                    >
                      {pingableDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.config?.ip || "Auto IP"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Destination Host</label>
                    <select
                      value={pingTarget || defaultTarget}
                      onChange={(e) => setPingTarget(e.target.value)}
                      className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-blue-500"
                      disabled={!isRunning}
                    >
                      {pingableDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.config?.ip || "Auto IP"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 font-semibold"
                    onClick={handlePingExecute}
                    disabled={!isRunning || pingableDevices.length < 2}
                  >
                    <Activity className="w-4 h-4" />
                    Execute Ping Test
                  </Button>
                </div>

                {realPingResult && (
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-xs mt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Ping Result ({realPingResult.source} → {realPingResult.target})</span>
                      <Badge variant={realPingResult.status === "success" ? "default" : "destructive"}>
                        {realPingResult.status === "success" ? "Success" : "Failed"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 text-center bg-card rounded-md border">
                      <div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Packet Loss</div>
                        <div className={`font-extrabold text-sm ${realPingResult.packet_loss === 0 ? "text-green-500" : "text-red-500"}`}>
                          {realPingResult.packet_loss}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Latency RTT</div>
                        <div className="font-extrabold text-sm text-blue-500">{realPingResult.latency || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Received / Sent</div>
                        <div className="font-extrabold text-sm">
                          {realPingResult.received || 0} / {realPingResult.transmitted || 4}
                        </div>
                      </div>
                    </div>

                    {realPingResult.output && (
                      <pre className="max-h-28 overflow-auto rounded-md bg-black/90 text-green-400 p-2.5 text-[10px] font-mono whitespace-pre-wrap border border-zinc-800">
                        {realPingResult.output}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Iperf Bandwidth Test Widget */}
            <Card className="p-5 border-2 border-emerald-500/30 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-base">Bandwidth Test (Iperf)</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">TCP Speedtest</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Source Host</label>
                    <select
                      value={iperfSource || defaultSource}
                      onChange={(e) => setIperfSource(e.target.value)}
                      className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                      disabled={!isRunning}
                    >
                      {pingableDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Target Host</label>
                    <select
                      value={iperfTarget || defaultTarget}
                      onChange={(e) => setIperfTarget(e.target.value)}
                      className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                      disabled={!isRunning}
                    >
                      {pingableDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Duration: {iperfDuration} sec</span>
                  </div>
                  <Slider
                    value={[iperfDuration]}
                    onValueChange={(val) => setIperfDuration(val[0])}
                    min={2}
                    max={15}
                    step={1}
                    disabled={!isRunning}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 font-semibold"
                    onClick={handleIperfExecute}
                    disabled={!isRunning || pingableDevices.length < 2}
                  >
                    <Zap className="w-4 h-4" />
                    Run Bandwidth Speedtest
                  </Button>
                </div>

                {realIperfResult && (
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-xs mt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>{realIperfResult.source} → {realIperfResult.target}</span>
                      <Badge variant="secondary">{realIperfResult.duration}s Test</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-2 text-center bg-card rounded-md border">
                      <div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Throughput Rate</div>
                        <div className="text-base font-extrabold text-emerald-500">
                          {realIperfResult.throughput || realIperfResult.bandwidth}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Data Transferred</div>
                        <div className="text-base font-extrabold">{realIperfResult.transfer}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: Advanced Real Traffic Generator */}
        <TabsContent value="traffic" className="space-y-6">
          <Card className="p-5 border-2 border-emerald-500/30 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base">Advanced Network Traffic Generator</h3>
              </div>
              <Badge variant={activeExperiment ? "default" : "secondary"}>
                {activeExperiment ? "Experiment Active" : "Ready"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Traffic Generator Mode</label>
                <select
                  value={expMode}
                  onChange={(e) => setExpMode(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background"
                  disabled={!isRunning || !!activeExperiment}
                >
                  <option value="fixed_data">Fixed Data Transfer (MB)</option>
                  <option value="fixed_packets">Fixed Packet Count</option>
                  <option value="fixed_rate">Fixed Data Rate (Mbps)</option>
                  <option value="fixed_pps">Fixed Packet Rate (PPS)</option>
                  <option value="continuous">Continuous Traffic Stream</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Source Node</label>
                <select
                  value={expSrc || defaultSource}
                  onChange={(e) => setExpSrc(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background"
                  disabled={!isRunning || !!activeExperiment}
                >
                  {pingableDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.config?.ip || "Auto IP"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Destination Node</label>
                <select
                  value={expDst || defaultTarget}
                  onChange={(e) => setExpDst(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background"
                  disabled={!isRunning || !!activeExperiment}
                >
                  {pingableDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.config?.ip || "Auto IP"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Protocol & Parameters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-lg mb-4 border">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Protocol</label>
                <select
                  value={expProto}
                  onChange={(e) => setExpProto(e.target.value)}
                  className="w-full text-xs h-9 px-2 rounded-md border bg-background"
                  disabled={!isRunning || !!activeExperiment}
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                </select>
              </div>

              {expMode === "fixed_data" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Data Size (MB)</label>
                  <input
                    type="number"
                    value={expDataSize}
                    onChange={(e) => setExpDataSize(e.target.value)}
                    className="w-full text-xs h-9 px-2.5 rounded-md border bg-background"
                    disabled={!isRunning || !!activeExperiment}
                  />
                </div>
              )}

              {expMode === "fixed_packets" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Packet Count</label>
                  <input
                    type="number"
                    value={expPacketCount}
                    onChange={(e) => setExpPacketCount(e.target.value)}
                    className="w-full text-xs h-9 px-2.5 rounded-md border bg-background"
                    disabled={!isRunning || !!activeExperiment}
                  />
                </div>
              )}

              {expMode === "fixed_rate" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Target Rate (Mbps)</label>
                  <input
                    type="number"
                    value={expRateMbps}
                    onChange={(e) => setExpRateMbps(e.target.value)}
                    className="w-full text-xs h-9 px-2.5 rounded-md border bg-background"
                    disabled={!isRunning || !!activeExperiment}
                  />
                </div>
              )}

              {expMode === "fixed_pps" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Packet Rate (PPS)</label>
                  <input
                    type="number"
                    value={expPps}
                    onChange={(e) => setExpPps(e.target.value)}
                    className="w-full text-xs h-9 px-2.5 rounded-md border bg-background"
                    disabled={!isRunning || !!activeExperiment}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Packet Size (Bytes)</label>
                <input
                  type="number"
                  value={expPacketSize}
                  onChange={(e) => setExpPacketSize(e.target.value)}
                  className="w-full text-xs h-9 px-2.5 rounded-md border bg-background"
                  disabled={!isRunning || !!activeExperiment}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Duration (Sec)</label>
                <input
                  type="number"
                  value={expDuration}
                  onChange={(e) => setExpDuration(e.target.value)}
                  className="w-full text-xs h-9 px-2.5 rounded-md border bg-background"
                  disabled={!isRunning || !!activeExperiment}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Parallel Streams</label>
                <input
                  type="number"
                  value={expStreams}
                  onChange={(e) => setExpStreams(e.target.value)}
                  min={1}
                  max={8}
                  className="w-full text-xs h-9 px-2.5 rounded-md border bg-background"
                  disabled={!isRunning || !!activeExperiment}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              {!activeExperiment ? (
                <Button
                  className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 font-semibold"
                  onClick={handleStartExperiment}
                  disabled={!isRunning || pingableDevices.length < 2}
                >
                  <Zap className="w-4 h-4" />
                  Start Real Network Experiment
                </Button>
              ) : (
                <Button
                  className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700 text-white h-10 px-6 font-semibold"
                  onClick={stopExperiment}
                >
                  <Square className="w-4 h-4" />
                  Stop Experiment
                </Button>
              )}
            </div>

            {activeExperiment && (
              <div className="mt-5 p-4 rounded-lg border bg-muted/40 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>
                    Experiment #{activeExperiment.id} ({activeExperiment.protocol} {activeExperiment.mode})
                  </span>
                  <Badge variant="default">{activeExperiment.progress_pct}% Completed</Badge>
                </div>

                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border">
                  <div
                    className="bg-emerald-500 h-2.5 transition-all duration-300"
                    style={{ width: `${activeExperiment.progress_pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <Card className="p-3">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Throughput</div>
                    <div className="text-base font-extrabold text-emerald-500">
                      {activeExperiment.metrics?.throughput_mbps} Mbps
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Latency RTT</div>
                    <div className="text-base font-extrabold text-blue-500">
                      {activeExperiment.metrics?.latency_ms} ms
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Packets / Sec</div>
                    <div className="text-base font-extrabold text-purple-500">
                      {activeExperiment.metrics?.pps} PPS
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Packet Loss</div>
                    <div className="text-base font-extrabold text-red-500">
                      {activeExperiment.metrics?.loss_pct}%
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </Card>

          {/* Recharts Real-Time Experiment Metrics Graph */}
          {activeExperiment && activeExperiment.timeline && (
            <Card className="p-5 border-2 shadow-sm">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Real-Time Experiment Metrics Graph
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeExperiment.timeline}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} label={{ value: 'Mbps / ms', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: 'Loss %', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="throughput_mbps" name="Throughput (Mbps)" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="latency_ms" name="Latency (ms)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="loss_pct" name="Packet Loss (%)" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 4: Link TC Network Conditions */}
        <TabsContent value="tc" className="space-y-6">
          <Card className="p-5 border-2 border-orange-500/30 shadow-sm">
            <CardHeader className="p-0 pb-4 border-b mb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Sliders className="w-5 h-5 text-orange-500" />
                Link Network Conditions (Traffic Control / TCLink)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Select Link</label>
                <select
                  value={tcLink}
                  onChange={(e) => setTcLink(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background"
                  disabled={!isRunning}
                >
                  <option value="">-- Choose Link --</option>
                  {connections.map((c) => {
                    const src = devices.find((d) => d.id === c.source)?.name || c.source;
                    const tgt = devices.find((d) => d.id === c.target)?.name || c.target;
                    return (
                      <option key={c.id} value={`${c.source}|${c.target}`}>
                        {src} ↔ {tgt}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Bandwidth: {tcBw} Mbps</span>
                  </div>
                  <Slider
                    value={[tcBw]}
                    onValueChange={(val) => setTcBw(val[0])}
                    min={1}
                    max={1000}
                    step={5}
                    disabled={!isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Delay: {tcDelay} ms</span>
                  </div>
                  <Slider
                    value={[tcDelay]}
                    onValueChange={(val) => setTcDelay(val[0])}
                    min={0}
                    max={200}
                    step={1}
                    disabled={!isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Packet Loss: {tcLoss}%</span>
                  </div>
                  <Slider
                    value={[tcLoss]}
                    onValueChange={(val) => setTcLoss(val[0])}
                    min={0}
                    max={50}
                    step={1}
                    disabled={!isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Max Queue Size: {tcQueue} pkts</span>
                  </div>
                  <Slider
                    value={[tcQueue]}
                    onValueChange={(val) => setTcQueue(val[0])}
                    min={10}
                    max={1000}
                    step={10}
                    disabled={!isRunning}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  className="w-full sm:w-auto gap-2 bg-orange-600 hover:bg-orange-700 text-white h-10 px-6 font-semibold"
                  onClick={handleApplyTc}
                  disabled={!isRunning || !tcLink}
                >
                  <Sliders className="w-4 h-4" />
                  Apply Network Conditions (Linux TC)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: Packet Inspector (tcpdump) */}
        <TabsContent value="capture" className="space-y-6">
          <Card className="p-5 border-2 border-cyan-500/30 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-500" />
                <h3 className="font-bold text-base">Real Packet Inspector (tcpdump)</h3>
              </div>
              <Badge variant={captureNode && captureActive[captureNode] ? "default" : "secondary"}>
                {captureNode && captureActive[captureNode] ? "Capturing Live" : "Idle"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Target Node</label>
                <select
                  value={captureNode}
                  onChange={(e) => setCaptureNode(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background"
                  disabled={!isRunning}
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">tcpdump Filter Expression</label>
                <input
                  type="text"
                  placeholder="e.g. icmp, tcp port 80, udp"
                  value={captureFilter}
                  onChange={(e) => setCaptureFilter(e.target.value)}
                  className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background"
                  disabled={!isRunning}
                />
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <Button
                className="w-full sm:w-auto gap-2 h-10 px-6 font-semibold"
                variant={captureNode && captureActive[captureNode] ? "destructive" : "default"}
                onClick={handleToggleCapture}
                disabled={!isRunning || !captureNode}
              >
                <Eye className="w-4 h-4" />
                {captureNode && captureActive[captureNode] ? "Stop Packet Capture" : "Start tcpdump Capture"}
              </Button>
            </div>

            {/* Packet Log Stream Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="p-3 bg-muted/60 font-semibold text-xs flex justify-between border-b">
                <span>Captured Packet Stream ({capturedPackets[captureNode]?.length || 0} packets)</span>
                <span className="font-mono text-[11px] text-muted-foreground">Node: {captureNode}</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-[11px] text-left font-mono">
                  <thead className="bg-muted/40 border-b sticky top-0">
                    <tr>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Source IP</th>
                      <th className="p-2.5">Destination IP</th>
                      <th className="p-2.5">Protocol</th>
                      <th className="p-2.5">Length</th>
                      <th className="p-2.5">Info Header</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!capturedPackets[captureNode] || capturedPackets[captureNode].length === 0) ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground">
                          No packets captured yet. Start capture and trigger ping or traffic.
                        </td>
                      </tr>
                    ) : (
                      capturedPackets[captureNode].map((pkt, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/30">
                          <td className="p-2.5 text-muted-foreground">{pkt.timestamp}</td>
                          <td className="p-2.5 text-blue-500 font-semibold">{pkt.src}</td>
                          <td className="p-2.5 text-emerald-500 font-semibold">{pkt.dst}</td>
                          <td className="p-2.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                              {pkt.protocol}
                            </Badge>
                          </td>
                          <td className="p-2.5">{pkt.length} B</td>
                          <td className="p-2.5 truncate max-w-xs">{pkt.info}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 6: Traceroute & Router Routes */}
        <TabsContent value="traceroute" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traceroute Widget */}
            <Card className="p-5 border-2 border-purple-500/30 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Workflow className="w-5 h-5 text-purple-500" />
                  <h3 className="font-bold text-base">Traceroute Hop Inspector</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Source Host</label>
                    <select
                      value={traceSrc || defaultSource}
                      onChange={(e) => setTraceSrc(e.target.value)}
                      className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background"
                      disabled={!isRunning}
                    >
                      {pingableDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Target Host</label>
                    <select
                      value={traceDst || defaultTarget}
                      onChange={(e) => setTraceDst(e.target.value)}
                      className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background"
                      disabled={!isRunning}
                    >
                      {pingableDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    className="w-full sm:w-auto gap-2 bg-purple-600 hover:bg-purple-700 text-white h-10 px-6 font-semibold"
                    onClick={handleRunTraceroute}
                    disabled={!isRunning}
                  >
                    <Workflow className="w-4 h-4" />
                    Execute Traceroute
                  </Button>
                </div>

                {tracerouteResult && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold">
                      Path Hops ({tracerouteResult.source} → {tracerouteResult.target})
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-background">
                      <table className="w-full text-xs text-left font-mono">
                        <thead className="bg-muted/60 border-b">
                          <tr>
                            <th className="p-2.5">Hop</th>
                            <th className="p-2.5">Node Name</th>
                            <th className="p-2.5">IP Address</th>
                            <th className="p-2.5">RTT Latency</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tracerouteResult.hops?.map((h, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2.5 font-bold text-purple-500">#{h.hop}</td>
                              <td className="p-2.5">{h.node_name || 'Node'}</td>
                              <td className="p-2.5">{h.ip}</td>
                              <td className="p-2.5 text-emerald-500 font-bold">{h.rtt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <pre className="max-h-28 overflow-auto rounded-md bg-black/90 text-green-400 p-2.5 text-[10px] font-mono whitespace-pre-wrap border border-zinc-800">
                      {tracerouteResult.output}
                    </pre>
                  </div>
                )}
              </div>
            </Card>

            {/* Routing Table Inspector */}
            <Card className="p-5 border-2 border-indigo-500/30 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Router className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-base">Router / Host Routing Table (`ip route`)</h3>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Select Node</label>
                  <select
                    value={routeNode}
                    onChange={(e) => setRouteNode(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-md border border-input bg-background"
                    disabled={!isRunning}
                  >
                    {routerOrHostDevices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-6 font-semibold"
                    onClick={handleFetchRoutes}
                    disabled={!isRunning || !routeNode}
                  >
                    <Router className="w-4 h-4" />
                    Fetch Routing Table
                  </Button>
                </div>

                {routingTableResult && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold">
                      Routes for {routingTableResult.node_name}
                    </div>
                    <div className="bg-black/90 text-green-400 font-mono text-[11px] p-3 rounded-lg max-h-48 overflow-y-auto space-y-1 border border-zinc-800">
                      {routingTableResult.routes?.map((r, idx) => (
                        <div key={idx}>{r}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 7: OpenFlow Flows & Experiment History */}
        <TabsContent value="history" className="space-y-6">
          {/* OpenFlow Flow Table Inspector */}
          <Card className="border-2 border-purple-500/30 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <span className="font-bold">OpenFlow Switch Flow Tables</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    fetchOpenFlows?.();
                    setShowFlows(!showFlows);
                  }}
                  disabled={!isRunning}
                >
                  {showFlows ? "Hide Flows" : "Fetch Flow Tables"}
                </Button>
              </CardTitle>
            </CardHeader>
            {showFlows && (
              <CardContent className="pt-4 space-y-4">
                {openflowFlows.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-6 border rounded-lg bg-muted/20">
                    No OpenFlow switch flows loaded. Ensure switches are running in topology.
                  </div>
                ) : (
                  openflowFlows.map((swFlow, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="text-xs font-bold">{swFlow.name} ({swFlow.mininet_name})</div>
                      <div className="bg-black/90 text-green-400 font-mono text-[10px] p-3.5 rounded-lg overflow-x-auto space-y-1 border border-zinc-800">
                        {swFlow.flows.map((fl, fidx) => (
                          <div key={fidx}>{fl}</div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>

          {/* Experiment History */}
          <Card className="border-2 border-indigo-500/30 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-5 h-5 text-indigo-500" />
                <span className="font-bold">Experiment History Store</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {experimentHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground border rounded-lg bg-muted/20">
                  No completed experiments yet. Run traffic experiments to compare throughput, latency, and packet loss!
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/60 font-semibold text-muted-foreground">
                        <th className="p-3">Exp ID</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3">Protocol</th>
                        <th className="p-3">Source → Destination</th>
                        <th className="p-3">Throughput</th>
                        <th className="p-3">Latency</th>
                        <th className="p-3">Loss %</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experimentHistory.map((exp, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-mono font-bold">#{exp.id}</td>
                          <td className="p-3 text-muted-foreground">{exp.start_time}</td>
                          <td className="p-3 uppercase text-[10px] font-bold">{exp.mode}</td>
                          <td className="p-3">{exp.protocol}</td>
                          <td className="p-3">{exp.src} → {exp.dst}</td>
                          <td className="p-3 text-emerald-500 font-bold">{exp.metrics?.throughput_mbps} Mbps</td>
                          <td className="p-3 text-blue-500 font-bold">{exp.metrics?.latency_ms} ms</td>
                          <td className="p-3 text-red-500 font-bold">{exp.metrics?.loss_pct}%</td>
                          <td className="p-3">
                            <Badge variant={exp.status === "completed" ? "default" : "secondary"}>
                              {exp.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimulationControls;
