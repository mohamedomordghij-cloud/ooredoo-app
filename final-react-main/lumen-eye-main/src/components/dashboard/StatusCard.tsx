import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getStatusBg, getStatusColor } from "@/lib/mock-data";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: "normal" | "warning" | "critical";
  icon: LucideIcon;
  subtitle?: string;
}

export function StatusCard({ title, value, unit, status, icon: Icon, subtitle }: StatusCardProps) {
  return (
    <Card className={cn("border", getStatusBg(status))}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-2xl font-bold", getStatusColor(status))}>{value}</span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", getStatusBg(status))}>
            <Icon className={cn("h-5 w-5", getStatusColor(status))} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
