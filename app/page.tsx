"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Circle, Upload, Key, Webhook, Database, Users, FileText, Settings } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
}

export default function PostSetupChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "guesty-api",
      title: "Paste Guesty API Key",
      description: "Enter your Guesty API key to enable property data sync",
      completed: false,
      icon: <Key className="h-4 w-4" />
    },
    {
      id: "webhook-secret",
      title: "(Optional) Paste Webhook Secret",
      description: "Add webhook secret for signature verification (skip if not needed)",
      completed: false,
      icon: <Webhook className="h-4 w-4" />
    },
    {
      id: "webhook-url",
      title: "Copy Guesty Webhook URL",
      description: "Configure webhook URL in Guesty for real-time updates",
      completed: false,
      icon: <Webhook className="h-4 w-4" />
    },
    {
      id: "initial-backfill",
      title: "Run Initial Backfill",
      description: "Import 24 months of historical data from Guesty",
      completed: false,
      icon: <Database className="h-4 w-4" />
    },
    {
      id: "rent-sheet",
      title: "Upload Monthly Rent Sheet",
      description: "Upload rent data for pricing floor calculations",
      completed: false,
      icon: <Upload className="h-4 w-4" />
    },
    {
      id: "api-keys",
      title: "Generate Agent API Keys",
      description: "Create API keys for Wheelhouse/OTA/SuiteOp/Conduit integrations",
      completed: false,
      icon: <Key className="h-4 w-4" />
    },
    {
      id: "reconcile-schedule",
      title: "(Optional) Set Reconciliation Schedule",
      description: "Configure nightly reconciliation at 03:30 local time",
      completed: false,
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "unit-playbook",
      title: "Create First Unit Playbook",
      description: "Set up operational playbooks from templates",
      completed: false,
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: "invite-users",
      title: "Invite Users",
      description: "Add team members with Admin/Analyst/Ops roles",
      completed: false,
      icon: <Users className="h-4 w-4" />
    }
  ]);

  const [guestyApiKey, setGuestyApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleCompleteSetup = () => {
    setIsSetupComplete(true);
    // In a real app, this would redirect to the main dashboard
    window.location.href = "/dashboard";
  };

  useEffect(() => {
    // Check if all required items are completed
    const requiredItems = checklist.filter(item => !item.title.includes("Optional"));
    const allRequiredCompleted = requiredItems.every(item => item.completed);
    setIsSetupComplete(allRequiredCompleted);
  }, [checklist]);

  if (isSetupComplete && completedCount === totalCount) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Setup Complete!</CardTitle>
            <CardDescription>
              Synergy OS is now configured and ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleCompleteSetup} className="synergy-accent-bg text-white">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome to <span className="synergy-accent">Synergy OS</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Complete these steps to get your rental management system up and running
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>Progress</span>
              <span>{completedCount} of {totalCount} completed</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="synergy-accent-bg h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Configuration Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Guesty API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 synergy-accent" />
                Guesty Integration
              </CardTitle>
              <CardDescription>
                Configure your Guesty connection for property data sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="guesty-api-key">API Key</Label>
                <Input
                  id="guesty-api-key"
                  type="password"
                  placeholder="Enter your Guesty API key"
                  value={guestyApiKey}
                  onChange={(e) => setGuestyApiKey(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
                <Input
                  id="webhook-secret"
                  type="password"
                  placeholder="Enter webhook secret for verification"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                />
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Label className="text-sm font-medium">Webhook URL</Label>
                <code className="block text-xs mt-1 p-2 bg-white dark:bg-slate-900 rounded border">
                  https://synergy-os-dev.lindy.site/webhooks/guesty
                </code>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Copy this URL to your Guesty webhook configuration
                </p>
              </div>
              <Button className="w-full" variant="outline">
                Test Connection
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 synergy-accent" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Essential setup actions to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Run Initial Backfill (24 months)
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Rent Sheet
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Generate API Keys
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Invite Team Members
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Checklist</CardTitle>
            <CardDescription>
              Complete all items to finish your Synergy OS setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checklist.map((item, index) => (
                <div key={item.id}>
                  <div 
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="mt-0.5">
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.icon}
                        <h3 className={`font-medium ${item.completed ? 'line-through text-slate-500' : ''}`}>
                          {item.title}
                        </h3>
                        {item.title.includes("Optional") && (
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                        )}
                      </div>
                      <p className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {index < checklist.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button 
            onClick={handleCompleteSetup}
            disabled={!isSetupComplete}
            className="synergy-accent-bg text-white px-8"
          >
            Complete Setup & Go to Dashboard
          </Button>
          <p className="text-sm text-slate-500 mt-2">
            Complete all required items to proceed
          </p>
        </div>
      </div>
    </div>
  );
}
