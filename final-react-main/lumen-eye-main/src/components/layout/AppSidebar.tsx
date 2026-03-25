import {
  Activity,
  LayoutDashboard,
  Server,
  Bell,
  Settings,
  Users,
  LogOut,
  ChevronDown,
  Cpu,
  MapPin,
  Brain,
  Info,
  UserCog,
  Eye,
  Gauge,
  Globe,
  Wifi,
  WifiOff,
  Unplug,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useDatacenter } from "@/hooks/useDatacenter";
import { useZones } from "@/hooks/useApiData";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mainNav = [
  { title: "Datacenters",   url: "/datacenters",  icon: Globe,   gated: false },
  { title: "Vue d'ensemble", url: "/overview",    icon: Eye,     gated: true  },
  { title: "Surveillance",  url: "/surveillance", icon: Gauge,   gated: true  },
  { title: "Alertes",       url: "/alerts",       icon: Bell,    gated: true  },
  { title: "Assistant IA",  url: "/ai",           icon: Brain,   gated: true  },
  { title: "Informations",  url: "/datacenter",   icon: Info,    gated: true  },
  { title: "Paramètres",    url: "/settings",     icon: Settings, gated: false },
];

const adminNav = [
  { title: "Utilisateurs", url: "/admin/users", icon: Users },
];

export function AppSidebar() {
  const { user, role, signOut } = useAuth();
  const { connectedDC, disconnect } = useDatacenter();
  const { data: zones } = useZones(connectedDC ? connectedDC.id : null);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isAdmin = role === "administrator";
  const isTechnician = role === "technicien";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-lg">O</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary">ooredoo</span>
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Sentinel IoT</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Connected DC badge */}
        {connectedDC && !collapsed && (
          <div className="mx-3 mt-3 rounded-lg bg-status-normal/10 border border-status-normal/30 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-status-normal" />
                <span className="text-[10px] font-semibold text-status-normal uppercase tracking-wider">Connecté</span>
              </div>
              <button onClick={disconnect} className="text-muted-foreground hover:text-foreground">
                <Unplug className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs font-medium text-foreground mt-0.5 truncate">{connectedDC.name}</p>
          </div>
        )}

        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const disabled = item.gated && !connectedDC;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {disabled ? (
                        <span className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground/40 cursor-not-allowed select-none">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <WifiOff className="h-3 w-3 ml-auto" />
                        </span>
                      ) : (
                        <NavLink
                          to={item.url}
                          end={item.url === "/datacenters" || item.url === "/"}
                          className="hover:bg-sidebar-accent"
                          activeClassName="bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Infrastructure tree */}
        <SidebarGroup>
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground">
              Infrastructure
              {!collapsed && <ChevronDown className="h-3 w-3" />}
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/datacenter" className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-primary font-medium">
                        <Server className="h-4 w-4" />
                        <span>Datacenter</span>
                        <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 border-status-normal text-status-normal">OK</Badge>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
{!connectedDC ? (
  <SidebarMenuItem>
    <div className="px-3 py-2 text-xs text-muted-foreground">
      Connecte-toi à un hub pour afficher les zones.
    </div>
  </SidebarMenuItem>
) : (zones || []).length === 0 ? (
  <SidebarMenuItem>
    <div className="px-3 py-2 text-xs text-muted-foreground">
      Aucune zone trouvée pour ce datacenter.
    </div>
  </SidebarMenuItem>
) : (
  (zones || []).map((z) => (
    <SidebarMenuItem key={z.id}>
      <SidebarMenuButton asChild>
        <NavLink
          to={`/zones/${z.id}`}
          className="hover:bg-sidebar-accent pl-8"
          activeClassName="bg-sidebar-accent text-primary font-medium"
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>{z.name}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))
)}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Technicien */}
        {isTechnician && (
          <SidebarGroup>
            <SidebarGroupLabel>Technicien</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                      <NavLink to="/technician" className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-primary font-medium">
                        <Cpu className="h-4 w-4" />
                        <span>Diagnostic</span>

                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-primary font-medium">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-3">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-sidebar-foreground">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{role ?? "..."}</p>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={signOut}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Status footer */}
        {!collapsed && (
          <div className="rounded-lg bg-muted/50 p-2.5 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">STATUS</span>
              <div className="flex items-center gap-1.5">
                {connectedDC ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-status-normal animate-pulse" />
                    <span className="font-semibold text-status-normal text-[10px]">LIVE</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="font-semibold text-muted-foreground text-[10px]">HORS LIGNE</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Hub</span>
              <span className="font-semibold text-foreground text-[10px] truncate max-w-[100px]">
                {connectedDC ? connectedDC.name : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Connectivité</span>
              <span className="font-semibold text-foreground">{connectedDC ? "100%" : "—"}</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
