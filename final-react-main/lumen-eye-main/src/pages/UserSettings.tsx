import { useState } from "react";
import { User, Shield, Bell, Settings, Moon, Sun, Globe, LayoutDashboard, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const roleLabels: Record<string, string> = {
  administrator: "Administrateur",
  superviseur: "Superviseur",
  technicien: "Technicien",
  utilisateur: "Utilisateur",
};

const UserSettings = () => {
  const { user, role } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("fr");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [aiNotifications, setAiNotifications] = useState(true);

  const handleSave = () => {
    toast({ title: "Paramètres sauvegardés", description: "Vos préférences ont été mises à jour." });
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Gérer votre profil, sécurité et préférences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-3.5 w-3.5" /> Profil</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Sécurité</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> Préférences</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations du Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                  {user?.email?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <p className="font-medium text-foreground">{user?.email}</p>
                  <Badge variant="outline" className="mt-1 capitalize">{role ? roleLabels[role] ?? role : "..."}</Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Nom complet</Label>
                  <Input id="fullname" placeholder="Votre nom" defaultValue={user?.user_metadata?.full_name ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input id="email" value={user?.email ?? ""} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="+216 XX XXX XXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept">Département</Label>
                  <Input id="dept" placeholder="Infrastructure IT" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Sauvegarder</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Changer le mot de passe</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input type="password" placeholder="Nouveau mot de passe" />
                  <Input type="password" placeholder="Confirmer le mot de passe" />
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium">Rôle & Permissions</Label>
                <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Rôle actuel</span><Badge variant="outline" className="capitalize">{role ? roleLabels[role] ?? role : "..."}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Accès</span><span className="text-foreground">{role === "administrator" ? "Système complet" : role === "superviseur" ? "Lecture + Gestion alertes" : role === "technicien" ? "Diagnostic nœuds" : "Lecture seule"}</span></div>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                Dernière connexion : {new Date().toLocaleString("fr-FR")}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Mettre à jour</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Préférences de Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Alertes par email</Label>
                  <p className="text-xs text-muted-foreground">Recevoir les alertes par email</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Critiques uniquement</Label>
                  <p className="text-xs text-muted-foreground">Ne recevoir que les alertes critiques</p>
                </div>
                <Switch checked={criticalOnly} onCheckedChange={setCriticalOnly} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Notifications IA</Label>
                  <p className="text-xs text-muted-foreground">Prédictions et recommandations de l'IA</p>
                </div>
                <Switch checked={aiNotifications} onCheckedChange={setAiNotifications} />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Sauvegarder</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Préférences Système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <div>
                    <Label className="text-sm">Thème</Label>
                    <p className="text-xs text-muted-foreground">{theme === "light" ? "Mode clair" : "Mode sombre"}</p>
                  </div>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <Label className="text-sm">Langue</Label>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <Label className="text-sm">Vue par défaut</Label>
                </div>
                <Select defaultValue="dashboard">
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Tableau de bord</SelectItem>
                    <SelectItem value="alerts">Alertes</SelectItem>
                    <SelectItem value="map">Carte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Sauvegarder</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettings;
