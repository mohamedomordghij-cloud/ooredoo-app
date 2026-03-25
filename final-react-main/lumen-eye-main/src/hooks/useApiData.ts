import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { socket } from "@/services/socket";
import { useDatacenter } from "@/hooks/useDatacenter";
import type { ReadingEvent, AlertEvent, StatusEvent } from "@/types/realtime";

// NOTE:
// This file used to talk to Supabase. It now talks to the Node/Express backend.
// To avoid rewriting the whole UI, we normalize backend fields to match the
// existing snake_case shape used in the components.

type BackendDatacenter = any;
type BackendZone = any;
type BackendNode = any;
type BackendAlert = any;
type BackendThreshold = any;

// ─── Datacenters ───
export function useDatacenters() {
  return useQuery({
    queryKey: ["datacenters"],
    queryFn: async () => {
      const res = await apiFetch<{ success: boolean; data: BackendDatacenter[] }>("/datacenters");
      // normalize to previous shape
      return (res.data || []).map((dc) => ({
        id: dc._id,
        name: dc.name,
        location: dc.location,
        status: dc.status,
        zones: (dc.zones || []).map((z: BackendZone) => ({
          id: z._id,
          name: z.name,
          status: z.status,
          nodes: (z.nodes || []).map((n: BackendNode) => ({
            id: n._id,
            is_online: !!n.isOnline,
          })),
        })),
      }));
    },
  });
}

// ─── Zones for a datacenter ───
export function useZones(datacenterId: string | null) {
  return useQuery({
    queryKey: ["zones", datacenterId],
    enabled: !!datacenterId,
    queryFn: async () => {
      const res = await apiFetch<{ success: boolean; data: BackendZone[] }>(
        `/zones?datacenterId=${encodeURIComponent(datacenterId!)}`
      );
      return (res.data || []).map((z) => ({
        id: z._id,
        name: z.name,
        description: z.description,
        status: z.status,
        datacenter_id: typeof z.datacenterId === "string" ? z.datacenterId : z.datacenterId?._id,
        nodes: (z.nodes || []).map((n: BackendNode) => ({
          id: n._id,
          name: n.name,
          is_online: !!n.isOnline,
          status: n.status,
          last_ping: n.lastPing,
          mac_address: n.macAddress,
          firmware_version: n.firmwareVersion,
        })),
      }));
    },
  });
}

// ─── Nodes for a datacenter ───
export function useNodes(datacenterId: string | null) {
  return useQuery({
    queryKey: ["nodes", datacenterId],
    enabled: !!datacenterId,
    queryFn: async () => {
      const res = await apiFetch<{ success: boolean; data: BackendNode[] }>(
        `/nodes?datacenterId=${encodeURIComponent(datacenterId!)}`
      );

      return (res.data || []).map((n) => ({
        id: n._id,
        name: n.name,
        is_online: !!n.isOnline,
        status: n.status,
        last_ping: n.lastPing,
        mac_address: n.macAddress,
        firmware_version: n.firmwareVersion,
        zone: n.zoneId
          ? {
              id: n.zoneId._id,
              name: n.zoneId.name,
              datacenter_id:
                typeof n.zoneId.datacenterId === "string"
                  ? n.zoneId.datacenterId
                  : n.zoneId.datacenterId?._id,
            }
          : null,
      }));
    },
  });
}

// ─── Latest sensor readings per node for a datacenter ───
export function useLatestReadings(datacenterId: string | null) {
  return useQuery({
    queryKey: ["latest-readings", datacenterId],
    enabled: !!datacenterId,
    refetchInterval: 15000,
    queryFn: async () => {
      const res = await apiFetch<{ success: boolean; data: any[] }>(
        `/sensors/latest?datacenterId=${encodeURIComponent(datacenterId!)}`
      );
      return (res.data || []).map((r) => ({
        id: r._id,
        node_id: r.nodeId,
        temperature: r.temperature,
        humidity: r.humidity,
        gas_level: r.gasLevel,
        pressure: r.pressure,
        vibration: r.vibration,
        recorded_at: r.recordedAt,
      }));
    },
  });
}

// ─── Sensor history for a datacenter (last 24h) ───
export function useSensorHistory(datacenterId: string | null) {
  return useQuery({
    queryKey: ["sensor-history", datacenterId],
    enabled: !!datacenterId,
    queryFn: async () => {
      const res = await apiFetch<{ success: boolean; data: any[] }>(
        `/sensors/history?datacenterId=${encodeURIComponent(datacenterId!)}&hours=6&limit=5000`
      );
      return (res.data || []).map((r) => ({
        id: r._id,
        node_id: r.nodeId?._id ?? r.nodeId,
        temperature: r.temperature,
        humidity: r.humidity,
        gas_level: r.gasLevel,
        pressure: r.pressure,
        vibration: r.vibration,
        recorded_at: r.recordedAt,
      }));
    },
  });
}

// ─── Alerts ───
export function useAlerts(datacenterId?: string | null) {
  return useQuery({
    queryKey: ["alerts", datacenterId],
    queryFn: async () => {
      const qs = datacenterId ? `?datacenterId=${encodeURIComponent(datacenterId)}&limit=200` : "?limit=200";
      const res = await apiFetch<{ success: boolean; data: BackendAlert[] }>(`/alerts${qs}`);
      return (res.data || []).map((a) => ({
        id: a._id,
        node_id: a.nodeId?._id ?? a.nodeId,
        zone_id: a.zoneId?._id ?? a.zoneId,
        metric_name: a.metricName,
        metric_value: a.metricValue,
        threshold_exceeded: a.thresholdExceeded,
        message: a.message,
        severity: a.severity,
        status: a.status,
        created_at: a.createdAt,
        acknowledged_at: a.acknowledgedAt,
        resolved_at: a.resolvedAt,
        node: a.nodeId ? { name: a.nodeId.name, zone: a.zoneId ? { name: a.zoneId.name } : null } : null,
      }));
    },
  });
}

// ─── Alert actions ───
export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ alertId }: { alertId: string }) => {
      await apiFetch(`/alerts/${alertId}/acknowledge`, { method: "PATCH" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      await apiFetch(`/alerts/${alertId}/resolve`, { method: "PATCH" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

// ─── Alert thresholds ───
export function useAlertThresholds(zoneId?: string) {
  return useQuery({
    queryKey: ["thresholds", zoneId],
    queryFn: async () => {
      const qs = zoneId ? `?zoneId=${encodeURIComponent(zoneId)}` : "";
      const res = await apiFetch<{ success: boolean; data: BackendThreshold[] }>(`/thresholds${qs}`);
      return (res.data || []).map((t) => ({
        id: t._id,
        zone_id: t.zoneId?._id ?? t.zoneId,
        metric_name: t.metricName,
        min_value: t.minValue,
        max_value: t.maxValue,
      }));
    },
  });
}

// ─── Realtime subscriptions ───
// The backend pushes realtime updates over Socket.IO.
// These hooks update React Query cache so the UI refreshes without manual reload.

function upsertById<T extends { id: string }>(arr: T[], item: T): T[] {
  const idx = arr.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...arr];
  const copy = arr.slice();
  copy[idx] = { ...copy[idx], ...item };
  return copy;
}

export function useRealtimeSensorReadings() {
  const qc = useQueryClient();
  const { connectedDC } = useDatacenter();
  const dcId = connectedDC?.id ?? null;

  useEffect(() => {
    if (!dcId) return;

    const onReading = (payload: ReadingEvent) => {
      if (payload.datacenterId !== dcId) return;

      // Update latest readings cache
      qc.setQueryData<any[]>(["latest-readings", dcId], (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const item = {
          id: `${payload.nodeId}:${new Date(payload.recordedAt).toISOString()}`,
          node_id: payload.nodeId,
          temperature: payload.values.temperature,
          humidity: payload.values.humidity,
          gas_level: payload.values.gasLevel,
          pressure: payload.values.pressure,
          vibration: payload.values.vibration,
          recorded_at: payload.recordedAt,
        };

        // keep one latest per node
        const filtered = list.filter((r: any) => r.node_id !== payload.nodeId);
        return [item, ...filtered];
      });

      // Append to history cache (keep a sliding window)
      qc.setQueryData<any[]>(["sensor-history", dcId], (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const item = {
          id: `${payload.nodeId}:${new Date(payload.recordedAt).toISOString()}`,
          node_id: payload.nodeId,
          temperature: payload.values.temperature,
          humidity: payload.values.humidity,
          gas_level: payload.values.gasLevel,
          pressure: payload.values.pressure,
          vibration: payload.values.vibration,
          recorded_at: payload.recordedAt,
        };
        const next = [...list, item];
        // keep last ~5000 points max to avoid memory blow
        return next.length > 5000 ? next.slice(next.length - 5000) : next;
      });
    };

    socket.on("reading:new", onReading);
    return () => {
      socket.off("reading:new", onReading);
    };
  }, [qc, dcId]);
}

export function useRealtimeAlerts() {
  const qc = useQueryClient();
  const { connectedDC } = useDatacenter();
  const dcId = connectedDC?.id ?? null;

  useEffect(() => {
    if (!dcId) return;

    const normalizeAlert = (a: any) => ({
      id: a._id,
      node_id: a.nodeId?._id ?? a.nodeId,
      zone_id: a.zoneId?._id ?? a.zoneId,
      metric_name: a.metricName,
      metric_value: a.metricValue,
      threshold_exceeded: a.thresholdExceeded,
      message: a.message,
      severity: a.severity,
      status: a.status,
      created_at: a.createdAt,
      acknowledged_at: a.acknowledgedAt,
      resolved_at: a.resolvedAt,
      node: a.nodeId ? { name: a.nodeId.name, zone: a.zoneId ? { name: a.zoneId.name } : null } : null,
    });

    const onAlert = (payload: AlertEvent) => {
      const a = payload?.alert;
      if (!a) return;
      const alert = normalizeAlert(a);

      qc.setQueryData<any[]>(["alerts", dcId], (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const next = upsertById(list, alert);
        // keep most recent first
        return next.sort((x: any, y: any) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime()).slice(0, 200);
      });
    };

    const onStatus = (payload: StatusEvent) => {
      if (!payload?.datacenter?.id || payload.datacenter.id !== dcId) return;

      // Update nodes cache
      qc.setQueryData<any[]>(["nodes", dcId], (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.map((n: any) => (n.id === payload.node.id ? { ...n, status: payload.node.status } : n));
      });

      // Update zones cache
      qc.setQueryData<any[]>(["zones", dcId], (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.map((z: any) => (z.id === payload.zone.id ? { ...z, status: payload.zone.status } : z));
      });

      // Update datacenters list cache (so map/badges refresh)
      qc.setQueryData<any[]>(["datacenters"], (prev: any) => {
        // useDatacenters query returns an array of normalized dcs
        const list = Array.isArray(prev) ? prev : [];
        return list.map((dc: any) => (dc.id === payload.datacenter.id ? { ...dc, status: payload.datacenter.status } : dc));
      });
    };

    socket.on("alert:event", onAlert);
    socket.on("status:update", onStatus);
    return () => {
      socket.off("alert:event", onAlert);
      socket.off("status:update", onStatus);
    };
  }, [qc, dcId]);
}

// Nodes are updated through status:update events (and normal polling). Keep for backward compatibility.
export function useRealtimeNodes() {}

// Admin user management (not implemented here yet)
export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: async () => [] });
}
export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async () => {}, onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }) });
}
