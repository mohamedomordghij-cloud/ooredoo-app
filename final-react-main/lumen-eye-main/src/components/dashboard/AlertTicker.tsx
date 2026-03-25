import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { mockAlerts, getSeverityColor } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const severityIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};

export function AlertTicker() {
  const activeAlerts = mockAlerts.filter((a) => a.status === "active");

  if (activeAlerts.length === 0) return null;

  return (
    <div className="bg-status-critical/10 border border-status-critical/20 rounded-lg p-3 mb-6">
      <div className="flex items-center gap-3 overflow-hidden">
        <AlertCircle className="h-4 w-4 text-status-critical shrink-0 animate-pulse-glow" />
        <div className="flex gap-6 overflow-x-auto">
          {activeAlerts.map((alert) => {
            const Icon = severityIcon[alert.severity];
            return (
              <div key={alert.id} className="flex items-center gap-2 whitespace-nowrap">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", getSeverityColor(alert.severity))} />
                <span className="text-sm text-foreground">{alert.message}</span>
                <span className="text-xs text-muted-foreground">{alert.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
