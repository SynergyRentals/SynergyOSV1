"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Key, 
  Webhook, 
  Database, 
  Upload, 
  Settings, 
  Users, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

export default function AdminPage() {
  const [guestyApiKey, setGuestyApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");

  const apiKeys = [
    { name: "Wheelhouse", key: "wh_***************", lastUsed: "2 hours ago", status: "active" },
    { name: "OTA Scraper", key: "ota_***************", lastUsed: "1 day ago", status: "active" },
    { name: "SuiteOp", key: "so_***************", lastUsed: "Never", status: "inactive" },
    { name: "Conduit", key: "cd_***************", lastUsed: "3 hours ago", status: "active" }
  ];

  const webhookEvents = [
    { event: "reservation.created", subscribed: true },
    { event: "reservation.updated", subscribed: true },
    { event: "reservation.cancelled", subscribed: true },
    { event: "listing.updated", subscribed: true },
    { event: "calendar.updated", subscribed: true },
    { event: "pricing.updated", subscribed: false }
  ];

  const handleTestConnection = async () => {
    setSyncStatus("testing");
    // Simulate API test
    setTimeout(() => {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }, 2000);
  };

  const handleRunBackfill = async () => {
    setSyncStatus("syncing");
    // Simulate backfill
    setTimeout(() => {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }, 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-slate-600 dark:text-slate-400">
            System configuration and management
          </p>
        </div>
        <Badge variant="outline">Dev Environment</Badge>
      </div>

      <Tabs defaultValue="connectors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="connectors">Connectors</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="pricing-floors">Pricing Floors</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Connectors Tab */}
        <TabsContent value="connectors" className="space-y-6">
          {/* Guesty Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 synergy-accent" />
                Guesty Integration
              </CardTitle>
              <CardDescription>
                Configure your primary data source connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guesty-api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="guesty-api-key"
                      type={showSecrets ? "text" : "password"}
                      placeholder="Enter your Guesty API key"
                      value={guestyApiKey}
                      onChange={(e) => setGuestyApiKey(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
                  <Input
                    id="webhook-secret"
                    type={showSecrets ? "text" : "password"}
                    placeholder="Enter webhook secret"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value="https://synergy-os-dev.lindy.site/webhooks/guesty"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("https://synergy-os-dev.lindy.site/webhooks/guesty")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Copy this URL to your Guesty webhook configuration
                </p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleTestConnection}
                  disabled={syncStatus === "testing"}
                  variant="outline"
                >
                  {syncStatus === "testing" ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : syncStatus === "success" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Connected
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleRunBackfill}
                  disabled={syncStatus === "syncing"}
                  className="synergy-accent-bg text-white"
                >
                  {syncStatus === "syncing" ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Running Backfill...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Run Initial Backfill (24m)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Events */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>
                Configure which events to receive from Guesty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {webhookEvents.map((event) => (
                  <div key={event.event} className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{event.event}</Label>
                    </div>
                    <Switch checked={event.subscribed} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 synergy-accent" />
                Agent API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for external agent integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{apiKey.name}</div>
                      <div className="text-sm text-slate-500 font-mono">{apiKey.key}</div>
                      <div className="text-xs text-slate-400">Last used: {apiKey.lastUsed}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>
                        {apiKey.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Regenerate
                      </Button>
                      <Button size="sm" variant="outline">
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Generate New API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Floors Tab */}
        <TabsContent value="pricing-floors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 synergy-accent" />
                Rent Data Upload
              </CardTitle>
              <CardDescription>
                Upload monthly rent data for pricing floor calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload Rent Sheet</p>
                  <p className="text-xs text-slate-500">
                    CSV file with columns: unit_code, monthly_rent, flat_opex, expected_occ, target_margin
                  </p>
                </div>
                <Button className="mt-4" variant="outline">
                  Choose File
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Default Flat OpEx</Label>
                  <Input type="number" defaultValue="700" />
                  <p className="text-xs text-slate-500">Monthly operational expenses</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Expected Occupancy %</Label>
                  <Input type="number" defaultValue="75" />
                  <p className="text-xs text-slate-500">Target occupancy for floor calc</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Target Margin %</Label>
                  <Input type="number" defaultValue="10" />
                  <p className="text-xs text-slate-500">Desired profit margin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 synergy-accent" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage team access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">synergyrentalstl@gmail.com</div>
                    <div className="text-sm text-slate-500">Synergy Admin</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="synergy-accent-bg text-white">Admin</Badge>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">analyst@synergy.com</div>
                    <div className="text-sm text-slate-500">Revenue Analyst</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Analyst</Badge>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">ops@synergy.com</div>
                    <div className="text-sm text-slate-500">Operations Manager</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Ops</Badge>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 synergy-accent" />
                System Health
              </CardTitle>
              <CardDescription>
                Monitor system status and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Connection</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Webhook Queue</span>
                    <Badge className="bg-green-100 text-green-800">0 pending</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Guesty Sync</span>
                    <Badge variant="outline">2 hours ago</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Rate Limits</span>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <Badge className="bg-green-100 text-green-800">0.1%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <Badge variant="outline">99.9%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
