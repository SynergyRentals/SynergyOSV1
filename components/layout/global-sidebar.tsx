"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen
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
      { name: "Connectors", href: "/admin" },
      { name: "API Keys", href: "/admin/api-keys" },
      { name: "Users", href: "/admin/users" },
      { name: "Pricing Floors", href: "/admin/pricing-floors" }
    ]
  }
];

interface GlobalSidebarProps {
  children: React.ReactNode;
}

export function GlobalSidebar({ children }: GlobalSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-expand parent items based on current path
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => pathname === child.href);
        if (hasActiveChild && !expandedItems.includes(item.name)) {
          setExpandedItems(prev => [...prev, item.name]);
        }
      }
    });
  }, [pathname, expandedItems]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b transition-all duration-200",
        isCollapsed && !isMobile ? "px-2 justify-center" : "px-6"
      )}>
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg synergy-accent-bg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="font-semibold text-lg whitespace-nowrap">Synergy OS</span>
          )}
        </Link>
      </div>

      {/* Collapse Toggle - Desktop Only */}
      {!isMobile && (
        <div className="flex justify-end p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

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
                    "w-full transition-all duration-200",
                    isCollapsed && !isMobile ? "justify-center px-2" : "justify-start",
                    isActive && "synergy-accent-bg text-white hover:bg-blue-600"
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpanded(item.name);
                    }
                  }}
                  asChild={!hasChildren}
                  title={isCollapsed && !isMobile ? item.name : undefined}
                >
                  {hasChildren ? (
                    <div className={cn(
                      "flex items-center w-full",
                      isCollapsed && !isMobile ? "justify-center" : "justify-between"
                    )}>
                      <div className="flex items-center">
                        <item.icon className={cn(
                          "h-4 w-4 flex-shrink-0",
                          (!isCollapsed || isMobile) && "mr-2"
                        )} />
                        {(!isCollapsed || isMobile) && item.name}
                      </div>
                      {(!isCollapsed || isMobile) && (
                        isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      )}
                    </div>
                  ) : (
                    <Link href={item.href} className="flex items-center w-full">
                      <item.icon className={cn(
                        "h-4 w-4 flex-shrink-0",
                        (!isCollapsed || isMobile) && "mr-2"
                      )} />
                      {(!isCollapsed || isMobile) && item.name}
                    </Link>
                  )}
                </Button>

                {/* Children */}
                {hasChildren && isExpanded && (!isCollapsed || isMobile) && (
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
      {(!isCollapsed || isMobile) && (
        <div className="border-t p-4">
          <div className="text-xs text-slate-500">
            <div>Synergy Rentals Group</div>
            <div>Internal V0 - Dev Environment</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-200 z-30",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="flex flex-col flex-grow bg-white dark:bg-slate-900 border-r">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden fixed top-4 left-4 z-40 bg-white dark:bg-slate-900 border shadow-md"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={cn(
        "flex flex-col flex-1 overflow-hidden transition-all duration-200",
        isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
