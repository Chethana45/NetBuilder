import { Card, CardContent } from "@/components/ui/card";
import { Users, Network, Zap, BookOpen } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      icon: Users,
      value: "10K+",
      label: "Active Users",
      color: "text-blue-600",
    },
    {
      icon: Network,
      value: "50K+",
      label: "Networks Created",
      color: "text-green-600",
    },
    {
      icon: Zap,
      value: "1M+",
      label: "Simulations Run",
      color: "text-purple-600",
    },
    {
      icon: BookOpen,
      value: "100+",
      label: "Learning Modules",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="bg-muted/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center border-0 bg-transparent">
                <CardContent className="p-6">
                  <Icon className={`w-8 h-8 mx-auto mb-4 ${stat.color}`} />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stats;
