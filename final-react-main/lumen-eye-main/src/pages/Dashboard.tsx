import {
  Thermometer,
  Server,
  Bell,
  Cpu,
} from "lucide-react";

import { StatusCard } from "@/components/dashboard/StatusCard";
import { AlertTicker } from "@/components/dashboard/AlertTicker";
import { MetricGauge } from "@/components/dashboard/MetricGauge";
import { ZoneOverview } from "@/components/dashboard/ZoneOverview";
import { TemperatureChart } from "@/components/dashboard/TemperatureChart";

import { useDatacenter } from "@/hooks/useDatacenter";
import {
  useLatestReadings,
  useNodes,
  useAlerts,
  useRealtimeSensorReadings,
  useRealtimeAlerts as useApiRealtimeAlerts,
} from "@/hooks/useApiData";

import { useMemo, useCallback, useState, useEffect } from "react";

import {
  useJoinDatacenter,
  useRealtimeReadings,
  useRealtimeAlerts as useSocketRealtimeAlerts,
} from "@/hooks/useRealtime";

import type { ReadingEvent, AlertEvent, SensorValues } from "@/types/realtime";

type NodeDTO = {
  isOnline?: boolean;
  is_online?: boolean;
};

type AlertDTO = {
  status?: "active" | "acknowledged" | "resolved" | string;
};

const Dashboard = () => {
  // ✅ ALL HOOKS MUST BE INSIDE THE COMPONENT
  const [liveReadings, setLiveReadings] =
    useState<Record<string, SensorValues>>({});

  const { connectedDC } = useDatacenter();
  const dcId = connectedDC?.id ?? null;

  // reset live readings when switching datacenter
  useEffect(() => {
    setLiveReadings({});
  }, [dcId]);

  const { data: latestReadings } = useLatestReadings(dcId);
  const { data: nodes } = useNodes(dcId);
  const { data: rawAlerts } = useAlerts(dcId);

  useRealtimeSensorReadings();
  useApiRealtimeAlerts();

  useJoinDatacenter(dcId ?? undefined);

  const onReading = useCallback((payload: ReadingEvent) => {
    setLiveReadings((prev) => ({
      ...prev,
      [payload.nodeId]: payload.values,
    }));
  }, []);

  const onAlert = useCallback((payload: AlertEvent) => {
    console.log("🚨 ALERT:", payload);
  }, []);

  useRealtimeReadings(onReading);
  useSocketRealtimeAlerts(onAlert);

  const metrics = useMemo(() => {
    const readingsArray = Object.values(liveReadings);
    if (!readingsArray.length) return null;

    const avg = (vals: number[]) =>
      vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

    const temps = readingsArray.map((r) => r.temperature);
    const hums = readingsArray.map((r) => r.humidity);
    const gas = readingsArray.map((r) => r.gasLevel);
    const press = readingsArray.map((r) => r.pressure);
    const vibs = readingsArray.map((r) => r.vibration);

    const getStatus = (val: number, max: number): "normal" | "warning" | "critical" =>
      val > max * 0.9 ? "critical" : val > max * 0.7 ? "warning" : "normal";

    return {
      temperature: { current: +avg(temps).toFixed(1), min: 15, max: 35, status: getStatus(avg(temps), 35) },
      humidity: { current: +avg(hums).toFixed(1), min: 20, max: 60, status: getStatus(avg(hums), 60) },
      gasLevel: { current: +avg(gas).toFixed(1), min: 0, max: 30, status: getStatus(avg(gas), 30) },
      pressure: { current: +avg(press).toFixed(0), min: 990, max: 1040, status: "normal" as const },
      vibration: { current: +avg(vibs).toFixed(2), min: 0, max: 1.5, status: getStatus(avg(vibs), 1.5) },
    };
  }, [liveReadings]);

  const onlineNodes =
    nodes?.filter((n: NodeDTO) => Boolean(n.isOnline ?? n.is_online)).length ?? 0;

  const totalNodes = nodes?.length ?? 0;

  const activeAlerts =
    rawAlerts?.filter((a: AlertDTO) => a.status === "active").length ?? 0;

  const dcStatus: "normal" | "warning" | "critical" =
    activeAlerts > 3 ? "critical" : activeAlerts > 0 ? "warning" : "normal";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de Bord</h1>
      <AlertTicker />
      {/* rest of UI unchanged */}
      <ZoneOverview />
      <TemperatureChart />
    </div>
  );
};

export default Dashboard;