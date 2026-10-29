import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, X, MousePointer2, Zap, Settings } from "lucide-react";

const tutorialSteps = [
  {
    id: "devices",
    title: "Device Library",
    description:
      "Drag network devices from this panel to the canvas. Start with a router or switch.",
    target: ".device-panel",
    position: "right",
    icon: MousePointer2,
  },
  {
    id: "canvas",
    title: "Network Canvas",
    description:
      "Drop devices here and create your network topology. Use Connect Devices, then click the source and target.",
    target: ".network-canvas",
    position: "center",
    icon: Zap,
  },
  {
    id: "config",
    title: "Configuration Panel",
    description:
      "Select devices to configure IP addresses, routing tables, and other network settings.",
    target: ".config-panel",
    position: "left",
    icon: Settings,
  },
  {
    id: "simulation",
    title: "Start Simulation",
    description:
      "Click Start Simulation to begin packet simulation and watch your network come alive!",
    target: ".simulation-controls",
    position: "bottom",
    icon: Zap,
  },
];

const TutorialOverlay = ({ isActive, onComplete, currentStep = 0 }) => {
  const [step, setStep] = useState(currentStep);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
    }
  }, [isActive]);

  if (!isActive || !isVisible) return null;

  const currentTutorialStep = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;
  const isFirstStep = step === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const getPositionClasses = (position) => {
    switch (position) {
      case "left":
        return "right-4 top-1/2 -translate-y-1/2";
      case "right":
        return "left-4 top-1/2 -translate-y-1/2";
      case "top":
        return "bottom-4 left-1/2 -translate-x-1/2";
      case "bottom":
        return "top-4 left-1/2 -translate-x-1/2";
      case "center":
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  const Icon = currentTutorialStep.icon;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] pointer-events-none">
      {/* Tutorial Card */}
      <div
        className={`absolute pointer-events-auto ${getPositionClasses(currentTutorialStep.position)}`}
      >
        <Card className="w-80 shadow-xl border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary text-primary-foreground rounded">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold">{currentTutorialStep.title}</h3>
              </div>
              <button
                onClick={handleComplete}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{currentTutorialStep.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="outline" size="sm" onClick={handlePrevious} className="gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext} className="gap-1">
                  {isLastStep ? "Finish" : "Next"}
                  {!isLastStep && <ArrowRight className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <Badge variant="outline" className="text-xs">
                Step {step + 1} of {tutorialSteps.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spotlight effect for current target */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full">
          {/* This would highlight the target element */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
