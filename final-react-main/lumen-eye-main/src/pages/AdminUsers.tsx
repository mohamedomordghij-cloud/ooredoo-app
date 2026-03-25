import { useState } from "react";
import { Users, Shield, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUsers, useUpdateUserRole } from "@/hooks/useApiData";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  administrator: "Administrateur",
  superviseur: "Superviseur",
  technicien: "Technicien",
  utilisateur: "Utilisateur",
};

const roleBadge: Record<string, string> = {
  administrator: "bg-status-critical/10 text-status-critical border-status-critical/30",
  superviseur: "bg-status-warning/10 text-status-warning border-status-warning/30",
  technicien: "bg-primary/10 text-primary border-primary/30",
  utilisateur: "bg-muted text-muted-foreground border-border",
};

const AdminUsers = () => {
  const { role } = useAuth();
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  if (role !== "administrator") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Accès réservé aux administrateurs</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>;
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRole.mutate(
      { userId, role: newRole },
      {
        onSuccess: () => {
          toast({ title: "Rôle mis à jour", description: `Le rôle a été changé en ${roleLabels[newRole]}` });
          setEditingUser(null);
        },
        onError: (e) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">Gérer les comptes et les rôles des utilisateurs</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex flex-col items-center"><span className="text-3xl font-bold text-foreground">{users?.length ?? 0}</span><span className="text-xs text-muted-foreground">Total Utilisateurs</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col items-center"><span className="text-3xl font-bold text-status-critical">{users?.filter((u) => u.role === "administrator").length ?? 0}</span><span className="text-xs text-muted-foreground">Administrateurs</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col items-center"><span className="text-3xl font-bold text-status-warning">{users?.filter((u) => u.role === "superviseur").length ?? 0}</span><span className="text-xs text-muted-foreground">Superviseurs</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col items-center"><span className="text-3xl font-bold text-primary">{users?.filter((u) => u.role === "technicien").length ?? 0}</span><span className="text-xs text-muted-foreground">Techniciens</span></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.profile?.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.user_id.slice(0, 8)}…</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingUser === u.user_id ? (
                      <Select defaultValue={u.role} onValueChange={(val) => handleRoleChange(u.user_id, val)}>
                        <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="administrator">Administrateur</SelectItem>
                          <SelectItem value="superviseur">Superviseur</SelectItem>
                          <SelectItem value="technicien">Technicien</SelectItem>
                          <SelectItem value="utilisateur">Utilisateur</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={cn("text-xs", roleBadge[u.role] ?? "")}>
                        {roleLabels[u.role] ?? u.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.profile?.created_at ? new Date(u.profile.created_at).toLocaleDateString("fr-FR") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingUser(editingUser === u.user_id ? null : u.user_id)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
