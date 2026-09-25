import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Play, MousePointer2, Zap, Network, CheckCircle } from "lucide-react";

const DemoInstructions = ({ networkName, isVisible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const instructions = {
    "Basic LAN Network": [
      {
        icon: MousePointer2,
        title: "Explore the Network",
        description:
          "This demo shows a basic LAN with a router, switch, and connected devices. Click on any device to see its configuration.",
        action: "Click on devices to select them",
      },
      {
        icon: Network,
        title: "View Connections",
        description:
          "Notice how devices are connected: Router → Switch → PCs/Server. Each connection shows bandwidth (100M/1000M).",
        action: "Observe the connection lines and labels",
      },
      {
        icon: Zap,
        title: "Start Simulation",
        description:
          "Click 'Start Simulation' to see packets flowing through the network. Watch the animated dots moving along connections.",
        action: "Click the Start Simulation button",
      },
      {
        icon: CheckCircle,
        title: "Monitor Traffic",
        description:
          "Switch to the 'Traffic Monitor' tab to see network statistics and run test scenarios like ping tests.",
        action: "Try the Simulation tab and test scenarios",
      },
    ],
    "Enterprise Network": [
      {
        icon: MousePointer2,
        title: "Complex Topology",
        description:
          "This enterprise network includes a firewall, router, multiple switches, and devices in different subnets.",
        action: "Explore the multi-tier network design",
      },
      {
        icon: Network,
        title: "Security Layer",
        description:
          "Notice the firewall at the edge, providing security between the internal network and external connections.",
        action: "Click on the firewall to see its configuration",
      },
      {
        icon: Zap,
        title: "Multiple Subnets",
        description:
          "Devices are organized into different subnets (Sales, IT) with different IP ranges (10.0.2.x, 10.0.3.x).",
        action: "Check IP addresses of different devices",
      },
      {
        icon: CheckCircle,
        title: "Run Advanced Tests",
        description:
          "Start simulation and try routing tests between different subnets to see how packets traverse the network.",
        action: "Test inter-subnet communication",
      },
    ],
  };

  const currentInstructions = instructions[networkName] || instructions["Basic LAN Network"];

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [isVisible, networkName]);

  if (!isVisible) return null;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < currentInstructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const currentInstruction = currentInstructions[currentStep];
  const Icon = currentInstruction.icon;
  const isLastStep = currentStep === currentInstructions.length - 1;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm">
      <Card className="shadow-xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary text-primary-foreground rounded">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{currentInstruction.title}</h3>
                <Badge variant="outline" className="text-xs mt-1">
                  {networkName} Demo
                </Badge>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-3">{currentInstruction.description}</p>

          <div className="bg-muted/50 rounded p-2 mb-4">
            <p className="text-xs font-medium text-primary">💡 {currentInstruction.action}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {currentInstructions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-primary"
                      : completedSteps.has(index)
                        ? "bg-green-500"
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs">
                Skip
              </Button>
              <Button size="sm" onClick={handleNext} className="text-xs gap-1">
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <Play className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {currentInstructions.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoInstructions;
