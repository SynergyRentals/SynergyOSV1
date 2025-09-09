"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Building2, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  FileText, 
  Zap,
  Menu,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Units",
    href: "/units",
    icon: Building2,
  },
  {
    name: "Reservations",
    href: "/reservations", 
    icon: Calendar,
  },
  {
    name: "Operations",
    href: "/ops",
    icon: Users,
    children: [
      { name: "Tasks", href: "/ops/tasks" },
      { name: "Issues", href: "/ops/issues" },
      { name: "Board", href: "/ops/board" }
    ]
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    children: [
      { name: "Performance", href: "/analytics/performance" },
      { name: "OTA Health", href: "/analytics/ota-health" },
      { name: "Pacing", href: "/analytics/pacing" }
    ]
  },
  {
    name: "Playbooks",
    href: "/playbooks",
    icon: FileText,
  },
  {
    name: "Agent Inbox",
    href: "/agents",
    icon: Zap,
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Settings,
    children: [
      { name: "Connectors", href: "/admin/connectors" },
      { name: "API Keys", href: "/admin/api-keys" },
      { name: "Users", href: "/admin/users" },
      { name: "Pricing Floors", href: "/admin/pricing-floors" }
    ]
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg synergy-accent-bg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-lg">Synergy OS</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isExpanded = expandedItems.includes(item.name);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.name}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "synergy-accent-bg text-white hover:bg-blue-600"
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpanded(item.name);
                    }
                  }}
                  asChild={!hasChildren}
                >
                  {hasChildren ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  ) : (
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  )}
                </Button>

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children?.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Button
                          key={child.href}
                          variant={isChildActive ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start",
                            isChildActive && "synergy-accent-bg text-white hover:bg-blue-600"
                          )}
                          asChild
                        >
                          <Link href={child.href}>
                            {child.name}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-slate-500">
          <div>Synergy Rentals Group</div>
          <div>Internal V0 - Dev Environment</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0", className)}>
        <div className="flex flex-col flex-grow bg-white dark:bg-slate-900 border-r">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
