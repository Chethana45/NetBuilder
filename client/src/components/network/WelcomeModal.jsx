import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Play, Network, Zap, Router, Monitor, Server } from "lucide-react";

const WelcomeModal = ({ isOpen, onClose, onLoadDemo }) => {
  if (!isOpen) return null;

  const demoNetworks = [
    {
      key: "basicLAN",
      name: "Basic LAN Network",
      description: "Perfect for beginners - Router, Switch, and PCs",
      devices: ["1 Router", "1 Switch", "2 PCs", "1 Server"],
      icon: Network,
      color: "bg-blue-500",
      difficulty: "Beginner",
    },
    {
      key: "enterpriseNetwork",
      name: "Enterprise Network",
      description: "Advanced setup with firewall and multiple subnets",
      devices: ["1 Firewall", "1 Router", "2 Switches", "4 End Devices"],
      icon: Router,
      color: "bg-purple-500",
      difficulty: "Advanced",
    },
  ];

  const handleLoadDemo = (networkKey) => {
    onLoadDemo(networkKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
              <Network className="w-6 h-6" />
            </div>
            Welcome to NetBuilder
          </CardTitle>
          <p className="text-muted-foreground">
            Build, configure, and simulate network topologies with NetBuilder
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Start Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4">🚀 Quick Start</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {demoNetworks.map((demo) => {
                const Icon = demo.icon;
                return (
                  <div
                    key={demo.key}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded ${demo.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{demo.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {demo.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{demo.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {demo.devices.map((device, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {device}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleLoadDemo(demo.key)}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Play className="w-4 h-4" />
                      Load {demo.name}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features Overview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">✨ Key Features</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <Network className="w-6 h-6" />
                </div>
                <h4 className="font-medium mb-1">Drag & Drop Design</h4>
                <p className="text-xs text-muted-foreground">
                  Intuitive interface for building networks
                </p>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="font-medium mb-1">Live Simulation</h4>
                <p className="text-xs text-muted-foreground">Watch packets flow in real-time</p>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <Router className="w-6 h-6" />
                </div>
                <h4 className="font-medium mb-1">Device Configuration</h4>
                <p className="text-xs text-muted-foreground">
                  Configure IPs, routing tables, and more
                </p>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div>
            <h3 className="text-lg font-semibold mb-4">📖 How to Use</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <strong>Design:</strong> Drag devices from the left panel to the canvas
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <strong>Connect:</strong> Double-click a device, then click another to create
                  connections
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <strong>Configure:</strong> Select devices to configure IP addresses and settings
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div>
                  <strong>Simulate:</strong> Click "Start Simulation" to see your network in action
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Start from Scratch
            </Button>
            <Button onClick={() => handleLoadDemo("basicLAN")} className="flex-1 gap-2">
              <Play className="w-4 h-4" />
              Try Basic Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeModal;
