import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Cpu, ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusColor, getStatusBg } from "@/lib/mock-data";

export default function ZoneDetails() {
  const { zoneId } = useParams();
  const navigate = useNavigate();

  const { data: zoneRes, isLoading: zLoading, error: zErr } = useQuery({
    queryKey: ["zone", zoneId],
    enabled: !!zoneId,
    queryFn: async () => apiFetch<{ success: boolean; data: any }>(`/zones/${zoneId}`),
  });

  const { data: nodesRes, isLoading: nLoading, error: nErr } = useQuery({
    queryKey: ["nodes-zone", zoneId],
    enabled: !!zoneId,
    queryFn: async () =>
      apiFetch<{ success: boolean; data: any[] }>(`/nodes?zoneId=${encodeURIComponent(zoneId!)}`),
    refetchInterval: 15000,
  });

  if (zLoading || nLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (zErr || nErr) {
    return (
      <div className="space-y-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <p className="text-sm text-destructive">
          Erreur lors du chargement de la zone. Vérifie que tu es connecté et que le token est valide.
        </p>
      </div>
    );
  }

  const zone = zoneRes?.data;
  const nodes = nodesRes?.data || [];
  const online = nodes.filter((n) => n.isOnline).length;
  const total = nodes.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Zone</h1>
          <p className="text-sm text-muted-foreground">Détails et état des nœuds</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
      </div>

      <Card className={cn("border", getStatusBg(zone?.status || "normal"))}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{zone?.name}</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Datacenter:</span>
                <span className="font-medium">{zone?.datacenterId?.name ?? "—"}</span>
              </div>
            </div>

            <Badge variant="outline" className={cn("ml-auto capitalize", getStatusColor(zone?.status || "normal"))}>
              {zone?.status === "normal" ? "Normal" : zone?.status === "warning" ? "Warning" : "Critical"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" /> Nœuds: {total}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {online > 0 ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            En ligne: {online}/{total}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nœuds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {nodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun nœud dans cette zone.</p>
          ) : (
            nodes.map((n) => (
              <div key={n._id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{n.name}</span>
                  <span className="text-xs text-muted-foreground">{n.macAddress || "—"}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn("capitalize", n.isOnline ? "border-status-normal text-status-normal" : "border-muted text-muted-foreground")}
                >
                  {n.isOnline ? "online" : "offline"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
