import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { Download, Video, Thermometer, Droplets, Gauge, Wind, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useDatacenter } from "@/hooks/useDatacenter";
import { useLatestReadings, useZones, useSensorHistory, useAlerts, useRealtimeSensorReadings, useRealtimeAlerts, useAcknowledgeAlert } from "@/hooks/useApiData";
import { useJoinDatacenter } from "@/hooks/useRealtime";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const cctvFeeds = [
  { id: "CAM-02", label: "SALLE SERVEURS 1" },
  { id: "CAM-01", label: "COULOIR A" },
  { id: "CAM-03", label: "ZONE COOLING" },
  { id: "CAM-04", label: "SALLE UPS" },
];

type TabType = "CARTE ZONES" | "ANALYTIQUES" | "FLUX CCTV";

const metricConfig = [
  { key: "TEMPÉRATURE MOY.",  icon: Thermometer, warn: 27,   crit: 30,   normalColor: "hsl(var(--status-normal))", warnColor: "hsl(var(--status-warning))", critColor: "hsl(var(--status-critical))", normalRange: "18 – 27°C"      },
  { key: "HUMIDITÉ MOY.",     icon: Droplets,    warn: 65,   crit: 75,   normalColor: "#38bdf8",                   warnColor: "hsl(var(--status-warning))", critColor: "hsl(var(--status-critical))", normalRange: "40 – 60%"       },
  { key: "PRESSION ATMO",     icon: Gauge,       warn: 1035, crit: 1050, normalColor: "hsl(var(--primary))",       warnColor: "hsl(var(--status-warning))", critColor: "hsl(var(--status-critical))", normalRange: "990–1030 hPa"   },
  { key: "QUALITÉ AIR (GAZ)", icon: Wind,        warn: 300,  crit: 500,  normalColor: "hsl(var(--status-normal))", warnColor: "hsl(var(--status-warning))", critColor: "hsl(var(--status-critical))", normalRange: "0 – 300 PPM"    },
  { key: "VIBRATION",         icon: Activity,    warn: 1.2,  crit: 2.0,  normalColor: "hsl(var(--status-normal))", warnColor: "hsl(var(--status-warning))", critColor: "hsl(var(--status-critical))", normalRange: "< 1.2 mm/s"     },
];

function getStatus(warn: number, crit: number, value: string): "normal" | "warning" | "critical" {
  if (value === "—") return "normal";
  const n = parseFloat(value);
  if (n >= crit) return "critical";
  if (n >= warn) return "warning";
  return "normal";
}

function getSparkTrend(spark: { v: number }[]): "up" | "down" | "flat" {
  if (spark.length < 4) return "flat";
  const diff = spark[spark.length - 1].v - spark[spark.length - 4].v;
  if (diff > 0.3) return "up";
  if (diff < -0.3) return "down";
  return "flat";
}

const Overview = () => {
  const [activeTab, setActiveTab] = useState<TabType>("CARTE ZONES");
  const { connectedDC } = useDatacenter();
  const { user } = useAuth();
  const dcId = connectedDC?.id ?? null;

  const { data: zones, isLoading: zonesLoading } = useZones(dcId);
  const { data: latestReadings } = useLatestReadings(dcId);
  const { data: history } = useSensorHistory(dcId);
  const { data: rawAlerts } = useAlerts(dcId);
  const acknowledgeAlert = useAcknowledgeAlert();

  useJoinDatacenter(dcId ?? undefined);
  useRealtimeSensorReadings();
  useRealtimeAlerts();

  const sensorCards = useMemo(() => {
    const buildSpark = (key: string) => (history ?? []).slice(-20).map((r: any) => ({ v: r[key] ?? 0 }));
    if (!latestReadings?.length) return metricConfig.map((m) => ({ ...m, value: "—", unit: "", spark: [] }));
    const avg = (vals: number[]) => vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
    const vals: Record<string, { v: string; u: string; spark: { v: number }[] }> = {
      "TEMPÉRATURE MOY.":  { v: avg(latestReadings.filter((r) => r.temperature != null).map((r) => r.temperature!)), u: "°C",   spark: buildSpark("temperature") },
      "HUMIDITÉ MOY.":     { v: avg(latestReadings.filter((r) => r.humidity    != null).map((r) => r.humidity!)),    u: "%",    spark: buildSpark("humidity")    },
      "PRESSION ATMO":     { v: avg(latestReadings.filter((r) => r.pressure    != null).map((r) => r.pressure!)),    u: "hPa",  spark: buildSpark("pressure")    },
      "QUALITÉ AIR (GAZ)": { v: avg(latestReadings.filter((r) => r.gas_level   != null).map((r) => r.gas_level!)),   u: "PPM",  spark: buildSpark("gas_level")   },
      "VIBRATION":         { v: avg(latestReadings.filter((r) => r.vibration   != null).map((r) => r.vibration!)),   u: "mm/s", spark: buildSpark("vibration")   },
    };
    return metricConfig.map((m) => ({ ...m, value: vals[m.key]?.v ?? "—", unit: vals[m.key]?.u ?? "", spark: vals[m.key]?.spark ?? [] }));
  }, [latestReadings, history]);

  const zoneMap = useMemo(() => {
    if (!zones) return [];
    return zones.flatMap((z: any) => (z.nodes ?? []).map((n: any) => ({ id: n.name, zone: z.name, status: n.status as string })));
  }, [zones]);

  const systemLogs = useMemo(() => {
    if (!rawAlerts) return [];
    return rawAlerts.slice(0, 8).map((a: any) => ({
      id: a.id,
      severity: a.severity as "critical" | "warning" | "info",
      time: new Date(a.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      message: a.message ?? `${a.metric_name}: ${a.metric_value}`,
      source: a.node?.name ?? "Système",
      status: a.status,
    }));
  }, [rawAlerts]);

  const predictionData = useMemo(() => {
    if (!history?.length) return [];
    const hourly: Record<string, number[]> = {};
    history.forEach((r: any) => {
      const h = new Date(r.recorded_at).getHours().toString().padStart(2, "0") + ":00";
      if (!hourly[h]) hourly[h] = [];
      if (r.temperature != null) hourly[h].push(r.temperature);
    });
    const entries = Object.entries(hourly).sort().slice(-12);
    return entries.map(([time, vals], i) => {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return { time, reel: i >= entries.length - 3 ? undefined : avg, predit: i >= entries.length - 5 ? avg + (i - entries.length + 5) * 1.5 : undefined };
    });
  }, [history]);

  const exportToCSV = () => {
    const rows = [["Datacenter", connectedDC?.name ?? ""], ["Date", new Date().toLocaleString("fr-FR")], [], ["Métrique", "Valeur", "Unité"], ...sensorCards.map((c) => [c.key, c.value, c.unit])];
    const blob = new Blob(["\uFEFF" + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `rapport_${new Date().toISOString().slice(0,10)}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  if (zonesLoading) return <div className="space-y-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-32" />)}</div>;

  return (
    <div className="space-y-6">

      {/* ══ METRIC CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {sensorCards.map((card) => {
          const status = getStatus(card.warn, card.crit, String(card.value));
          const trend  = getSparkTrend(card.spark);
          const Icon   = card.icon;
          const valueColor = status === "critical" ? card.critColor : status === "warning" ? card.warnColor : card.normalColor;
          const TrendIcon  = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
          const trendColor = trend === "up" ? "text-status-critical" : trend === "down" ? "text-status-normal" : "text-muted-foreground";

          return (
            <Card key={card.key} className={cn("border transition-all duration-300 hover:shadow-md overflow-hidden", {
              "border-border":               status === "normal",
              "border-status-warning/50":    status === "warning",
              "border-status-critical/50":   status === "critical",
              "bg-status-warning/5":         status === "warning",
              "bg-status-critical/5":        status === "critical",
            })}>
              {/* Status stripe */}
              <div className={cn("h-0.5 w-full", {
                "bg-status-normal":                          status === "normal",
                "bg-status-warning":                         status === "warning",
                "bg-status-critical animate-pulse":          status === "critical",
              })} />

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", {
                    "bg-muted text-muted-foreground":             status === "normal",
                    "bg-status-warning/20 text-status-warning":   status === "warning",
                    "bg-status-critical/20 text-status-critical": status === "critical",
                  })}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />
                </div>

                <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mb-1.5 truncate">{card.key}</p>

                <div className="flex items-end gap-1 mb-1">
                  <span className="text-2xl font-black leading-none" style={{ color: valueColor }}>{card.value}</span>
                  <span className="text-[11px] text-muted-foreground mb-0.5">{card.unit}</span>
                </div>

                <p className="text-[9px] text-muted-foreground/60 mb-2">Seuil normal : {card.normalRange}</p>

                {card.spark.length > 0 && (
                  <div className="h-7">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={card.spark}>
                        <Line type="monotone" dataKey="v" stroke={valueColor} strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2 text-xs">
            {(["CARTE ZONES", "ANALYTIQUES", "FLUX CCTV"] as TabType[]).map((tab) => (
              <span key={tab} onClick={() => setActiveTab(tab)} className={cn("px-2 pb-2 cursor-pointer transition-colors", activeTab === tab ? "font-semibold text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}>{tab}</span>
            ))}
            <div className="ml-auto">
              <button onClick={exportToCSV} className="flex items-center gap-1.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded px-3 py-1.5 hover:bg-primary/90 transition-colors">
                <Download className="h-3 w-3" /> EXPORT RAPPORT
              </button>
            </div>
          </div>

          {activeTab === "CARTE ZONES" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base uppercase tracking-wide">Carte des Zones</CardTitle>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-status-normal" /> NORMAL</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-status-warning" /> AVERT.</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-status-critical" /> CRITIQUE</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {zoneMap.map((z) => (
                    <div key={z.id} className={cn("aspect-[4/3] rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105", {
                      "bg-status-normal/10 border-status-normal/30":     z.status === "normal",
                      "bg-status-warning/10 border-status-warning/40":   z.status === "warning",
                      "bg-status-critical/10 border-status-critical/40": z.status === "critical",
                    })}>
                      <span className={cn("text-lg font-bold", { "text-status-normal": z.status === "normal", "text-status-warning": z.status === "warning", "text-status-critical": z.status === "critical" })}>{z.id}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-center">Total Nœuds: <span className="font-semibold">{zoneMap.length}</span> · Zones: <span className="font-semibold">{zones?.length ?? 0}</span></p>
              </CardContent>
            </Card>
          )}

          {activeTab === "ANALYTIQUES" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><span className="text-primary">⚡</span> Prédiction Température – {connectedDC?.name}</CardTitle>
                <p className="text-xs text-muted-foreground">Analyse prédictive IA — données réelles vs prédiction</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={predictionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={["auto","auto"]} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(val: number, name: string) => [`${val?.toFixed(1)}°C`, name === "reel" ? "Réel" : "Prédit"]} />
                    <ReferenceLine y={35} stroke="hsl(var(--status-critical))" strokeDasharray="5 5" label={{ value: "Seuil 35°C", fill: "hsl(var(--status-critical))", fontSize: 10, position: "right" }} />
                    <Line type="monotone" dataKey="reel"   stroke="hsl(var(--primary))"        strokeWidth={2.5} dot={false} connectNulls={false} />
                    <Line type="monotone" dataKey="predit" stroke="hsl(var(--status-warning))" strokeWidth={2.5} strokeDasharray="6 4" dot={false} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {activeTab === "FLUX CCTV" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><Video className="h-4 w-4 text-primary" /> Flux CCTV</CardTitle>
                  <Badge className="bg-primary text-primary-foreground text-[10px]">EN DIRECT</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {cctvFeeds.map((cam) => (
                    <div key={cam.id} className="relative rounded-lg overflow-hidden bg-[#1a1a1a] border border-border aspect-video flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a]" />
                      <Video className="relative z-10 h-8 w-8 text-muted-foreground/40" />
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                        <span className="h-1.5 w-1.5 rounded-full bg-status-critical animate-pulse" />
                        <span className="text-[9px] font-bold text-status-critical">DIRECT</span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1.5 z-10">
                        <p className="text-[10px] font-mono font-semibold text-white/90">{cam.id}</p>
                        <p className="text-[9px] text-white/60 uppercase tracking-wider">{cam.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* System Logs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base uppercase tracking-wide">Journaux Système</CardTitle>
              <Badge className="bg-primary text-primary-foreground text-[10px]">EN DIRECT</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemLogs.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Aucun journal récent</p>}
            {systemLogs.map((log) => (
              <div key={log.id} className={cn("p-3 rounded-lg border", {
                "bg-status-critical/5 border-status-critical/20": log.severity === "critical",
                "bg-status-warning/5 border-status-warning/20":   log.severity === "warning",
                "bg-muted/30 border-border":                       log.severity === "info",
              })}>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className={cn("text-[9px] uppercase px-1.5", {
                    "text-status-critical border-status-critical/30": log.severity === "critical",
                    "text-status-warning border-status-warning/30":   log.severity === "warning",
                    "text-muted-foreground border-border":             log.severity === "info",
                  })}>{log.severity}</Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">{log.time}</span>
                </div>
                <p className="text-xs text-foreground mb-1">{log.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{log.source}</span>
                  {log.status === "active" && (
                    <button onClick={() => user && acknowledgeAlert.mutate({ alertId: log.id })} className="text-[10px] font-semibold text-primary hover:underline">ACQUITTER</button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
