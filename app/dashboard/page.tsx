"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Home, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Zap
} from "lucide-react";

interface KPICard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

interface Alert {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  unit?: string;
}

interface Recommendation {
  id: string;
  module: string;
  title: string;
  confidence: number;
  unit?: string;
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPICard[]>([
    {
      title: "Occupancy Rate",
      value: "78.5%",
      change: "+2.3%",
      trend: "up",
      icon: <Home className="h-4 w-4" />
    },
    {
      title: "Average Daily Rate",
      value: "$127",
      change: "+$8",
      trend: "up", 
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: "RevPAR",
      value: "$99.70",
      change: "+$12.40",
      trend: "up",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "Pacing vs Target",
      value: "103.2%",
      change: "+3.2%",
      trend: "up",
      icon: <BarChart3 className="h-4 w-4" />
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "warning",
      title: "Low Occupancy Alert",
      description: "TG-001 has <55% occupancy for next 14 days",
      unit: "TG-001"
    },
    {
      id: "2", 
      type: "info",
      title: "Pricing Stale",
      description: "SL-002 pricing hasn't been updated in 7+ days",
      unit: "SL-002"
    },
    {
      id: "3",
      type: "success",
      title: "Sync Complete",
      description: "Guesty data sync completed successfully"
    }
  ]);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: "1",
      module: "Revenue",
      title: "Increase Base Rate for Tower Grove Loft",
      confidence: 0.87,
      unit: "TG-001"
    },
    {
      id: "2",
      module: "Ops", 
      title: "Schedule Deep Clean for Soulard Townhouse",
      confidence: 0.92,
      unit: "SL-002"
    },
    {
      id: "3",
      module: "Ranking",
      title: "Optimize Photos for Central West End Penthouse", 
      confidence: 0.78,
      unit: "CWE-003"
    }
  ]);

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.75) return <Badge className="synergy-accent-bg text-white">High</Badge>;
    if (confidence >= 0.5) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back! Here's what's happening with your properties.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">3 Units Active</Badge>
          <Badge variant="outline">St. Louis, MO</Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : kpi.trend === "down" ? (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                ) : null}
                <span className={kpi.trend === "up" ? "text-green-500" : kpi.trend === "down" ? "text-red-500" : ""}>
                  {kpi.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="recommendations">Agent Inbox</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Occupancy Chart Placeholder */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Occupancy Trend (30 Days)</CardTitle>
                <CardDescription>Daily occupancy rates across all properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Chart visualization would go here</p>
                    <p className="text-xs text-slate-400">Connected to Recharts for production</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Channel Mix */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Mix</CardTitle>
                <CardDescription>Revenue by OTA platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Airbnb</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <Progress value={45} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">VRBO</span>
                  <span className="text-sm font-medium">35%</span>
                </div>
                <Progress value={35} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Booking.com</span>
                  <span className="text-sm font-medium">20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm">New reservation confirmed for CWE-003</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-4 w-4 synergy-accent" />
                  <div className="flex-1">
                    <p className="text-sm">Pricing updated for TG-001 via Wheelhouse</p>
                    <p className="text-xs text-slate-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm">Guest checked out of SL-002</p>
                    <p className="text-xs text-slate-500">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{alert.title}</h3>
                        {alert.unit && (
                          <Badge variant="outline">{alert.unit}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {alert.description}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Zap className="h-4 w-4 synergy-accent mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{rec.module}</Badge>
                          {rec.unit && <Badge variant="outline">{rec.unit}</Badge>}
                        </div>
                        {getConfidenceBadge(rec.confidence)}
                      </div>
                      <h3 className="font-medium mb-1">{rec.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Confidence: {Math.round(rec.confidence * 100)}%
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm" className="synergy-accent-bg text-white">
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
