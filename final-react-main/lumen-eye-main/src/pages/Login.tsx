import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Activity, Wifi, Shield, BarChart3, Eye, EyeOff } from "lucide-react";

// ── Animated grid background dots ──
const GridDots = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="white" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

// ── Live stat pill ──
const StatPill = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
    <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div>
      <p className="text-[10px] text-white/60 uppercase tracking-widest font-medium">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  </div>
);

const Login = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      toast({ title: "Erreur de connexion", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = signupEmail.trim().toLowerCase();
    const emailDomain = emailLower.split("@")[1]?.toLowerCase();
    const isException = emailLower === "mohamedomor.dghij@isimg.tn";
    if (emailDomain !== "ooredoo.tn" && !isException) {
      toast({
        title: "Inscription refusée",
        description: "Seules les adresses email @ooredoo.tn sont autorisées.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    if (error) {
      toast({ title: "Erreur d'inscription", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Inscription réussie", description: "Vérifiez votre email pour confirmer votre compte." });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen font-sans">

      {/* ══════════════════════════════════════
          PANNEAU GAUCHE — Ooredoo Branding
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-[#C8102E] flex-col overflow-hidden">
        <GridDots />

        {/* Diagonal accent */}
        <div className="absolute -right-16 top-0 bottom-0 w-32 bg-[#A00E25] skew-x-[-3deg]" />

        {/* Top-left logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Sentinel IoT</p>
              <p className="text-white/60 text-[10px] tracking-widest uppercase">by Ooredoo</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-12 pb-10">
          <div className="mb-2">
            <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 border border-white/20 rounded-full px-3 py-1 mb-6">
              Plateforme de surveillance
            </span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.05] mb-5 tracking-tight">
            Datacenter<br />
            <span className="text-white/40">Intelligence</span><br />
            Platform
          </h1>

          <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-10">
            Surveillance IoT en temps réel de vos infrastructures. Alertes intelligentes, métriques environnementales et prédiction IA.
          </p>

          {/* Stats */}
          <div className="space-y-3 max-w-xs">
            <StatPill icon={Wifi} label="Nodes connectés" value="10 en ligne" />
            <StatPill icon={BarChart3} label="Lectures capteurs" value="Temps réel" />
            <StatPill icon={Shield} label="Sécurité" value="JWT · Chiffré" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 border-t border-white/10 px-12 py-5 flex items-center justify-between">
          <p className="text-white/40 text-[10px] tracking-wider uppercase">© 2026 Ooredoo Tunisia</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/50 text-[10px] font-medium">Système opérationnel</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          PANNEAU DROIT — Formulaire Auth
      ══════════════════════════════════════ */}
      <div className="flex w-full lg:w-[48%] items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold">Sentinel IoT</p>
              <p className="text-[10px] text-muted-foreground">Ooredoo Datacenter</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <div>
              <div className="mb-7">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Bon retour 👋</h2>
                <p className="text-sm text-muted-foreground mt-1">Connectez-vous à votre tableau de bord</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="vous@ooredoo.tn"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="h-11 border-border bg-muted/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-11 border-border bg-muted/50 focus:bg-background transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-bold text-sm tracking-wide"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Activity className="h-4 w-4 animate-spin" /> Connexion...
                    </span>
                  ) : "Se connecter"}
                </Button>
              </form>
            </div>
          )}

          {/* ── SIGNUP FORM ── */}
          {tab === "signup" && (
            <div>
              <div className="mb-7">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Créer un compte</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Réservé aux adresses <span className="font-semibold text-primary">@ooredoo.tn</span>
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nom complet
                  </Label>
                  <Input
                    id="signup-name"
                    placeholder="Votre nom"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="h-11 border-border bg-muted/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="vous@ooredoo.tn"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="h-11 border-border bg-muted/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 caractères"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="h-11 border-border bg-muted/50 focus:bg-background transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-bold text-sm tracking-wide"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Activity className="h-4 w-4 animate-spin" /> Inscription...
                    </span>
                  ) : "S'inscrire"}
                </Button>
              </form>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-[11px] text-muted-foreground mt-8">
            Sentinel IoT Platform · Ooredoo Tunisia · 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
