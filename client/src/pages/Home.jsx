import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  Zap,
  Router,
  Monitor,
  Play,
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
} from "lucide-react";
import DotGrid from "@/components/blocks/Heros/DotGrid";
import Stats from "@/components/blocks/Stats";

const Home = () => {
  const navigate = useNavigate();

  const demoNetworks = [
    {
      key: "basic",
      name: "Basic LAN Network",
      description: "Perfect for beginners - Router, Switch, and PCs",
      devices: ["1 Router", "1 Switch", "2 PCs", "1 Server"],
      icon: Network,
      color: "bg-blue-500",
      difficulty: "Beginner",
    },
    {
      key: "enterprise",
      name: "Enterprise Network",
      description: "Advanced setup with firewall and multiple subnets",
      devices: ["1 Firewall", "1 Router", "2 Switches", "4 End Devices"],
      icon: Router,
      color: "bg-purple-500",
      difficulty: "Advanced",
    },
  ];

  const features = [
    {
      icon: Network,
      title: "Drag & Drop Design",
      description: "Intuitive interface for building network topologies",
      color: "bg-blue-500",
    },
    {
      icon: Zap,
      title: "Live Simulation",
      description: "Watch packets flow through your network in real-time",
      color: "bg-green-500",
    },
    {
      icon: Router,
      title: "Device Configuration",
      description: "Configure IPs, routing tables, and network settings",
      color: "bg-purple-500",
    },
    {
      icon: CheckCircle,
      title: "Network Testing",
      description: "Run ping tests, simulate failures, and analyze traffic",
      color: "bg-orange-500",
    },
  ];

  const handleStartSimulator = () => {
    navigate("/network-simulator");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <DotGrid />
          {/* Animated background shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/3 to-purple-500/3 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Floating Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-3xl shadow-2xl animate-float">
                  <Network className="w-16 h-16" />
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-6 mb-12">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground">
                NetBuilder
              </h1>

              <div className="max-w-4xl mx-auto">
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Build, configure, and simulate network topologies with
                  <span className="text-primary font-semibold"> NetBuilder</span>. Master networking
                  concepts through hands-on experience.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                onClick={handleStartSimulator}
                size="lg"
                className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-102"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Play className="w-6 h-6 mr-3" />
                Launch Simulator
              </Button>

              <Button
                onClick={() => navigate("/contact")}
                variant="outline"
                size="lg"
                className="group border-2 border-muted-foreground/20 hover:border-primary/50 px-12 py-6 text-xl font-semibold rounded-2xl backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-300 hover:scale-102"
              >
                <BookOpen className="w-6 h-6 mr-3" />
                Learn More
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {[
                { icon: Zap, text: "Real-time Simulation" },
                { icon: Router, text: "Cisco-like Interface" },
                { icon: Monitor, text: "Interactive Learning" },
                { icon: CheckCircle, text: "Network Testing" },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-6 py-3 bg-background/60 backdrop-blur-sm border border-border/50 rounded-full text-sm font-medium hover:bg-background/80 transition-all duration-300 hover:scale-102"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {feature.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Network Simulation</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to design, build, and test network infrastructures with NetBuilder
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div
                    className={`w-16 h-16 ${feature.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <Stats />

      {/* Demo Networks Section */}
      <div className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Ready-to-Use Network Templates</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Jump right in with pre-configured network topologies designed for learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {demoNetworks.map((demo) => {
              const Icon = demo.icon;
              return (
                <Card key={demo.key} className="hover:shadow-lg transition-all hover:scale-102">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${demo.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{demo.name}</CardTitle>
                          <Badge variant="outline">{demo.difficulty}</Badge>
                        </div>
                        <p className="text-muted-foreground">{demo.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {demo.devices.map((device, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {device}
                        </Badge>
                      ))}
                    </div>
                    <Button onClick={handleStartSimulator} className="w-full gap-2">
                      <Play className="w-4 h-4" />
                      Try {demo.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started with network simulation in just a few simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              step: 1,
              title: "Design",
              description: "Drag devices from the library to the canvas",
              icon: Monitor,
            },
            {
              step: 2,
              title: "Connect",
              description: "Double-click devices to create connections",
              icon: Network,
            },
            {
              step: 3,
              title: "Configure",
              description: "Set IP addresses and network settings",
              icon: Router,
            },
            {
              step: 4,
              title: "Simulate",
              description: "Watch packets flow through your network",
              icon: Zap,
            },
          ].map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  {index < 3 && (
                    <ArrowRight className="hidden md:block absolute top-6 -right-12 w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Building Networks?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of students and professionals learning networking through hands-on
            simulation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartSimulator}
              size="lg"
              variant="secondary"
              className="gap-2 text-lg px-8 py-6"
            >
              <Play className="w-5 h-5" />
              Launch Simulator
            </Button>
            <Button
              onClick={() => navigate("/contact")}
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Users className="w-5 h-5" />
              Get Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
