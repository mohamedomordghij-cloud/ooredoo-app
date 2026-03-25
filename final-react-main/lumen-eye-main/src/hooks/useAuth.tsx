import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { apiFetch, getToken, setToken } from "@/lib/api";
import { setSocketToken } from "@/services/socket";

export type AppRole = "administrator" | "superviseur" | "technicien" | "utilisateur";

export type AppUser = {
  _id: string;
  email: string;
  fullName: string;
  role: AppRole;
  avatarUrl?: string | null;
};

interface AuthContextType {
  user: AppUser | null;
  token: string | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a token exists, validate it and fetch current user
    const boot = async () => {
      const existing = getToken();
      setTokenState(existing);
      setSocketToken(existing);

      if (!existing) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const me = await apiFetch<{ success: boolean; user: AppUser }>("/auth/me", { auth: true });
        setUser(me.user);
        setRole(me.user.role);
      } catch {
        // token invalid/expired
        setToken(null);
        setTokenState(null);
        setSocketToken(null);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiFetch<{
        success: boolean;
        token: string;
        user: AppUser;
      }>("/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });

      setToken(res.token);
      setTokenState(res.token);
      setSocketToken(res.token);
      setUser(res.user);
      setRole(res.user.role);
      return { error: null };
    } catch (e: any) {
      return { error: e as Error };
    }
  };

  
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await apiFetch<{
        success: boolean;
        message?: string;
        user?: AppUser;
      }>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password, fullName }),
      });

      // ✅ Email verification is mandatory now: no auto-login here
      return { error: null };
    } catch (e: any) {
      return { error: e as Error };
    }
  };

  const signOut = async () => {
    setToken(null);
    setTokenState(null);
    setSocketToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
