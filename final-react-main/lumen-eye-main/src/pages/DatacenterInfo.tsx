import { Server, MapPin, Calendar, Users, Cpu, Wifi, HardDrive, Wrench, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useDatacenter } from "@/hooks/useDatacenter";
import { useZones, useNodes } from "@/hooks/useApiData";
import { getStatusColor, getStatusBg } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

const DatacenterInfo = () => {
  const { connectedDC } = useDatacenter();
  const dcId = connectedDC?.id ?? null;
  const { data: zones, isLoading: zLoading } = useZones(dcId);
  const { data: nodes, isLoading: nLoading } = useNodes(dcId);

  if (zLoading || nLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Informations</h1>
        <p className="text-sm text-muted-foreground">Détails structurels et configuration du système</p>
      </div>

      {connectedDC && (
        <Card className={cn("border", getStatusBg(connectedDC.status))}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{connectedDC.name}</CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{connectedDC.location}</div>
              </div>
              <Badge variant="outline" className={cn("ml-auto capitalize", getStatusColor(connectedDC.status))}>
                {connectedDC.status === "normal" ? "Actif" : connectedDC.status === "warning" ? "Attention" : "Critique"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Activity className="h-3.5 w-3.5" /> Zones: {zones?.length ?? 0}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Cpu className="h-3.5 w-3.5" /> Nœuds: {nodes?.length ?? 0}</div>
          </CardContent>
        </Card>
      )}

      {/* Zones */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Zones d'Infrastructure</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(zones ?? []).map((zone: any) => (
              <div key={zone.id} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className={cn("h-4 w-4", getStatusColor(zone.status))} />
                    <span className="text-sm font-semibold text-foreground">{zone.name}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(zone.status))}>{zone.status === "normal" ? "Normal" : zone.status === "warning" ? "Attention" : "Critique"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{zone.description}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{zone.nodes?.length ?? 0} nœuds</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nodes table */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Capteurs & Nœuds IoT</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernier Ping</TableHead>
                <TableHead>Firmware</TableHead>
                <TableHead>MAC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(nodes ?? []).map((node: any) => (
                <TableRow key={node.id}>
                  <TableCell className="font-mono text-xs font-medium">{node.name}</TableCell>
                  <TableCell className="text-xs">{node.zone?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", node.is_online ? "text-status-normal border-status-normal/30" : "text-status-critical border-status-critical/30")}>
                      {node.is_online ? "En ligne" : "Hors ligne"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{node.last_ping ? new Date(node.last_ping).toLocaleString("fr-FR") : "—"}</TableCell>
                  <TableCell className="text-xs font-mono">{node.firmware_version ?? "—"}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{node.mac_address ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Network & Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Wifi className="h-4 w-4" /> Réseau & Communication</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Protocole</span><span className="font-medium">MQTT / HTTP</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Fréquence</span><span className="font-medium">10 secondes</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Broker MQTT</span><span className="font-medium font-mono">mqtt.ooredoo-dc.tn</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Connectivité</span><Badge variant="outline" className="text-[10px] text-status-normal border-status-normal/30">Opérationnel</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Maintenance</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Dernière maintenance</span><span className="font-medium">2026-02-10</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Prochaine planifiée</span><span className="font-medium">2026-03-10</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Version firmware cible</span><span className="font-medium font-mono">v2.1.3</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nœuds à jour</span><span className="font-medium">{nodes?.filter((n: any) => n.firmware_version === "v2.1.3").length}/{nodes?.length ?? 0}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatacenterInfo;
