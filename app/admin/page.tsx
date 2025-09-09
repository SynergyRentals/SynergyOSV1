"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  EyeOff,
  RefreshCw,
  TestTube,
  Activity
} from "lucide-react";

interface ConnectionStatus {
  connected: boolean;
  lastTest?: string;
  error?: string;
  testing: boolean;
}

interface WebhookStats {
  totalEvents: number;
  verifiedEvents: number;
  recentEvents: number;
  lastEvent?: {
    receivedAt: string;
    eventType: string;
    verified: boolean;
  };
  verificationRate: number;
  queueDepth: number;
  activeRequests: number;
}

export default function AdminPage() {
  const [guestyClientId, setGuestyClientId] = useState("");
  const [guestyClientSecret, setGuestyClientSecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    testing: false,
  });
  const [webhookStats, setWebhookStats] = useState<WebhookStats | null>(null);
  const [backfillStatus, setBackfillStatus] = useState("idle");

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
    { event: "listing.calendar.updated", subscribed: true },
    { event: "pricing.updated", subscribed: false }
  ];

  useEffect(() => {
    loadWebhookStats();
  }, []);

  const loadWebhookStats = async () => {
    try {
      const response = await fetch('/api/webhooks/guesty');
      if (response.ok) {
        const stats = await response.json();
        setWebhookStats(stats);
      }
    } catch (error) {
      console.error('Failed to load webhook stats:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!guestyClientId || !guestyClientSecret) {
      setConnectionStatus({
        connected: false,
        testing: false,
        error: "Please enter Client ID and Client Secret",
      });
      return;
    }

    setConnectionStatus({ connected: false, testing: true });

    try {
      const response = await fetch('/api/admin/guesty/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'admin', // In production, get from auth context
          clientId: guestyClientId,
          clientSecret: guestyClientSecret,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConnectionStatus({
          connected: true,
          testing: false,
          lastTest: new Date().toLocaleString(),
        });
      } else {
        setConnectionStatus({
          connected: false,
          testing: false,
          error: result.error,
        });
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        testing: false,
        error: "Connection test failed",
      });
    }
  };

  const handleGenerateWebhookSecret = async () => {
    try {
      const response = await fetch('/api/admin/webhook/generate-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'admin' }),
      });

      const result = await response.json();

      if (result.success) {
        setWebhookSecret(result.secret);
      } else {
        console.error('Failed to generate webhook secret:', result.error);
      }
    } catch (error) {
      console.error('Failed to generate webhook secret:', error);
    }
  };

  const handleRunBackfill = async () => {
    setBackfillStatus("running");
    // Simulate backfill process
    setTimeout(() => {
      setBackfillStatus("completed");
      setTimeout(() => setBackfillStatus("idle"), 3000);
    }, 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getConnectionStatusBadge = () => {
    if (connectionStatus.testing) {
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1 animate-spin" />Testing...</Badge>;
    }
    if (connectionStatus.connected) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
    }
    if (connectionStatus.error) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
    }
    return <Badge variant="outline">Not Tested</Badge>;
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="connectors">Connectors</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="pricing-floors">Pricing Floors</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Connectors Tab */}
        <TabsContent value="connectors" className="space-y-6">
          {/* Guesty OAuth2 Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 synergy-accent" />
                Guesty OAuth2 Integration
              </CardTitle>
              <CardDescription>
                Configure OAuth2 Client Credentials for secure API access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Connection Status:</span>
                  {getConnectionStatusBadge()}
                </div>
                {connectionStatus.lastTest && (
                  <span className="text-xs text-slate-500">
                    Last tested: {connectionStatus.lastTest}
                  </span>
                )}
              </div>

              {connectionStatus.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{connectionStatus.error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guesty-client-id">Client ID</Label>
                  <Input
                    id="guesty-client-id"
                    placeholder="Enter your Guesty Client ID"
                    value={guestyClientId}
                    onChange={(e) => setGuestyClientId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guesty-client-secret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="guesty-client-secret"
                      type={showSecrets ? "text" : "password"}
                      placeholder="Enter your Guesty Client Secret"
                      value={guestyClientSecret}
                      onChange={(e) => setGuestyClientSecret(e.target.value)}
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
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleTestConnection}
                  disabled={connectionStatus.testing}
                  variant="outline"
                >
                  {connectionStatus.testing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleRunBackfill}
                  disabled={backfillStatus === "running" || !connectionStatus.connected}
                  className="synergy-accent-bg text-white"
                >
                  {backfillStatus === "running" ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Running Backfill...
                    </>
                  ) : backfillStatus === "completed" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Backfill Complete
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Run Initial Backfill (24m)
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                <strong>OAuth2 Scopes:</strong> read:listings, read:reservations, read:calendar, write:calendar
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          {/* Webhook Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 synergy-accent" />
                Webhook Security
              </CardTitle>
              <CardDescription>
                Configure HMAC signature verification and replay protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Webhook Secret</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="webhook-secret"
                    type={showSecrets ? "text" : "password"}
                    placeholder="Generate or enter webhook secret"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateWebhookSecret}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Used for HMAC-SHA256 signature verification
                </p>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value="https://synergy-os-dev.lindy.site/api/webhooks/guesty"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("https://synergy-os-dev.lindy.site/api/webhooks/guesty")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Copy this URL to your Guesty webhook configuration
                </p>
              </div>

              {/* Webhook Stats */}
              {webhookStats && (
                <div className="grid gap-4 md:grid-cols-3 mt-6">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Total Events</div>
                    <div className="text-2xl font-bold">{webhookStats.totalEvents}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Verification Rate</div>
                    <div className="text-2xl font-bold">{webhookStats.verificationRate.toFixed(1)}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Queue Depth</div>
                    <div className="text-2xl font-bold">{webhookStats.queueDepth}</div>
                  </div>
                </div>
              )}

              {webhookStats?.lastEvent && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded">
                  <div className="text-sm font-medium mb-1">Last Event</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {webhookStats.lastEvent.eventType} • {new Date(webhookStats.lastEvent.receivedAt).toLocaleString()}
                    {webhookStats.lastEvent.verified ? (
                      <Badge className="ml-2 bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-2">Failed</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhook Events */}
          <Card>
            <CardHeader>
              <CardTitle>Event Subscriptions</CardTitle>
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
                <Activity className="h-5 w-5 synergy-accent" />
                System Status
              </CardTitle>
              <CardDescription>
                Monitor system health and performance
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
                    <span className="text-sm">OAuth Token Status</span>
                    <Badge variant="outline">
                      {connectionStatus.connected ? "Valid" : "Not Set"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Webhook Queue</span>
                    <Badge className="bg-green-100 text-green-800">
                      {webhookStats?.queueDepth || 0} pending
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Webhook</span>
                    <Badge variant="outline">
                      {webhookStats?.lastEvent 
                        ? new Date(webhookStats.lastEvent.receivedAt).toLocaleTimeString()
                        : "None"
                      }
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Requests</span>
                    <Badge variant="outline">{webhookStats?.activeRequests || 0}/15</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rate Limit (24h)</span>
                    <Badge className="bg-green-100 text-green-800">0 hits</Badge>
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

              <Separator className="my-4" />

              <div className="flex space-x-2">
                <Button variant="outline" onClick={loadWebhookStats}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Stats
                </Button>
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Run Delta Sync
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
