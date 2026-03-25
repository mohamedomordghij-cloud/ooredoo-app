import { useState, useRef, useEffect } from "react";
import { Brain, TrendingUp, AlertTriangle, Zap, MessageSquare, Send, Activity, Shield, ThermometerSun, Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockAIPredictions, mockAnomalies, getSeverityColor } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// Simulated prediction chart data
const predictionData = Array.from({ length: 12 }, (_, i) => ({
  time: `${String(10 + i).padStart(2, "0")}:00`,
  actual: i < 6 ? 28 + Math.random() * 4 : undefined,
  predicted: i >= 5 ? 30 + i * 1.2 + Math.random() * 2 : undefined,
}));

const aiRecommendations = [
  { id: "rec-1", priority: "critical" as const, action: "Vérifier le système de refroidissement en Zone A", detail: "Température en hausse progressive depuis 6h", target: "Charguia / Zone A" },
  { id: "rec-2", priority: "warning" as const, action: "Inspecter la batterie UPS et planifier le remplacement", detail: "Niveau batterie à 15%, en dessous du seuil de 20%", target: "Sousse / Zone C" },
  { id: "rec-3", priority: "warning" as const, action: "Dysfonctionnement capteur possible – vérifier ESP32-B3", detail: "Interruptions fréquentes de communication", target: "Charguia / Zone B" },
  { id: "rec-4", priority: "info" as const, action: "Réduire la charge serveur temporairement", detail: "Corrélation entre charge CPU et température ambiante", target: "Charguia / Zone A" },
];

const AIAssistant = () => {
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    { role: "ai", content: "Bonjour ! Je suis l'assistant IA du système de monitoring. Je peux analyser les tendances, prédire les risques et vous aider à comprendre les alertes. Posez-moi une question !" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    // Simulated AI response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", content: `Analyse en cours pour "${userMsg}"... Le datacenter Charguia présente actuellement le risque le plus élevé avec une température en hausse dans la Zone A. Je recommande une inspection du système de refroidissement dans les 2 prochaines heures.` },
      ]);
    }, 1000);
  };

  const healthStatus = "warning" as "normal" | "warning" | "critical";

  const healthLabel = { normal: "Stable", warning: "Risque Détecté", critical: "Critique" };
  const healthCardStyle = {
    normal: "border-status-normal/30 bg-status-normal/5",
    warning: "border-status-warning/30 bg-status-warning/5",
    critical: "border-status-critical/30 bg-status-critical/5",
  };
  const healthBadgeStyle = {
    normal: "bg-status-normal/10 text-status-normal border-status-normal/30",
    warning: "bg-status-warning/10 text-status-warning border-status-warning/30",
    critical: "bg-status-critical/10 text-status-critical border-status-critical/30",
  };
  const healthIconStyle = {
    normal: "text-status-normal",
    warning: "text-status-warning",
    critical: "text-status-critical",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assistant IA</h1>
        <p className="text-sm text-muted-foreground">Analyse prédictive et insights intelligents</p>
      </div>

      {/* AI Overview Panel */}
      <Card className={healthCardStyle[healthStatus]}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-status-warning/10 flex items-center justify-center shrink-0">
              <Brain className={cn("h-6 w-6", healthIconStyle[healthStatus])} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-foreground">État du Système :</span>
                <Badge className={cn("text-xs", healthBadgeStyle[healthStatus])} variant="outline">
                  {healthLabel[healthStatus]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                IA a détecté une augmentation anormale de température au Datacenter Charguia – L'efficacité du refroidissement pourrait se dégrader dans les 2 prochaines heures.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {mockAIPredictions.length} prédictions</span>
                <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {mockAnomalies.length} anomalies</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {aiRecommendations.length} recommandations</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-status-warning" /> Prédictions & Analyse de Risque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAIPredictions.map((pred) => (
                <div key={pred.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <ThermometerSun className={cn("h-5 w-5 mt-0.5 shrink-0", getSeverityColor(pred.severity))} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{pred.datacenter} / {pred.zone}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5">{pred.probability}% risque</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {pred.metric} : {pred.currentValue} → {pred.predictedValue} (seuil: {pred.threshold})
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Défaillance estimée dans <span className="font-medium text-foreground">{pred.timeToFailure}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prediction Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Prédiction Température – Zone A Charguia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[25, 45]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <ReferenceLine y={35} stroke="hsl(var(--status-critical))" strokeDasharray="5 5" label={{ value: "Seuil 35°C", fill: "hsl(var(--status-critical))", fontSize: 10 }} />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Réel" />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--status-warning))" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Prédit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Anomalies */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-status-critical" /> Détection d'Anomalies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAnomalies.map((anom) => (
                <div key={anom.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <AlertTriangle className={cn("h-5 w-5 mt-0.5 shrink-0", getSeverityColor(anom.severity))} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{anom.datacenter} / {anom.zone} – {anom.node}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{anom.parameter}</span> – Plage normale: {anom.normalRange}
                    </p>
                    <p className="text-xs text-status-warning mt-0.5">{anom.currentPattern}</p>
                    <span className="text-[10px] text-muted-foreground">{anom.timestamp}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Recommendations + Chat */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Recommandations IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5", {
                      "border-status-critical text-status-critical": rec.priority === "critical",
                      "border-status-warning text-status-warning": rec.priority === "warning",
                      "border-muted-foreground text-muted-foreground": rec.priority === "info",
                    })}>
                      {rec.priority === "critical" ? "Urgent" : rec.priority === "warning" ? "Important" : "Info"}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{rec.action}</p>
                  <p className="text-xs text-muted-foreground mb-1">{rec.detail}</p>
                  <span className="text-[10px] text-muted-foreground">{rec.target}</span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Floating Chat Button + Panel */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen && (
          <Card className="absolute bottom-16 right-0 w-[380px] flex flex-col shadow-2xl border rounded-2xl overflow-hidden" style={{ height: 500 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <span className="text-base font-semibold text-foreground">Messages</span>
              <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {chatMessages.length > 1 ? (
                <div className="divide-y divide-border">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                        msg.role === "ai" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                      )}>
                        {msg.role === "ai" ? <Brain className="h-5 w-5" /> : "👤"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {msg.role === "ai" ? "Assistant IA" : "Vous"}
                          </span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">now</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-12">
                  <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
                  <p>Aucun message pour le moment</p>
                </div>
              )}
            </div>

            {/* Ask a question input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Poser une question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="text-sm rounded-full"
                />
                <Button size="icon" className="rounded-full shrink-0" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setChatOpen((v) => !v)}
        >
          {chatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant;
