import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Shield, User, Search, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  studentId: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<"name" | "role" | "dateJoined" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { data: allUsers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${id}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setConfirmDialogOpen(false);
      setUserToUpdate(null);
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to update user role.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (user: User, newRoleValue: string) => {
    // Prevent changing role if user is admin and trying to demote
    if (user.role === "admin" && newRoleValue === "student") {
      toast({
        title: "Cannot Demote Admin",
        description: "Admins cannot be demoted. This action is not allowed.",
        variant: "destructive",
      });
      return;
    }

    // Prevent self-demotion
    if (user.id === currentUser?.id && newRoleValue === "student" && user.role === "admin") {
      toast({
        title: "Cannot Remove Your Own Admin Role",
        description: "You cannot remove your own admin privileges.",
        variant: "destructive",
      });
      return;
    }

    // If role hasn't changed, don't do anything
    if (user.role === newRoleValue) {
      return;
    }

    setUserToUpdate(user);
    setNewRole(newRoleValue);
    setConfirmDialogOpen(true);
  };

  const confirmRoleChange = () => {
    if (userToUpdate && newRole) {
      updateRoleMutation.mutate({ id: userToUpdate.id, role: newRole });
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <Badge className="gap-1 bg-purple-500 hover:bg-purple-600">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <User className="h-3 w-3" />
        Student
      </Badge>
    );
  };

  const filteredUsers = allUsers?.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Sort users based on selected field and direction
  const sortedUsers = filteredUsers ? [...filteredUsers].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;

    switch (sortField) {
      case "name":
        const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
        const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      case "role":
        comparison = a.role.localeCompare(b.role);
        break;
      case "dateJoined":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  }) : [];

  const handleSort = (field: "name" | "role" | "dateJoined") => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: "name" | "role" | "dateJoined") => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const stats = {
    total: allUsers?.length || 0,
    admins: allUsers?.filter((u) => u.role === "admin").length || 0,
    students: allUsers?.filter((u) => u.role === "student").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage user accounts and roles
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card data-testid="card-total-users">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total">{stats.total}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-admin-users">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admins</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-admins">{stats.admins}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-student-users">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Students</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-students">{stats.students}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or student ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-users"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full md:w-[200px]" data-testid="select-role-filter">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({sortedUsers.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedUsers && sortedUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">
                            <button
                              onClick={() => handleSort("name")}
                              className="flex items-center hover:text-primary transition-colors"
                            >
                              Name
                              {getSortIcon("name")}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium">Email</th>
                          <th className="text-left p-4 font-medium">Student ID</th>
                          <th className="text-left p-4 font-medium">
                            <button
                              onClick={() => handleSort("role")}
                              className="flex items-center hover:text-primary transition-colors"
                            >
                              Role
                              {getSortIcon("role")}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium">
                            <button
                              onClick={() => handleSort("dateJoined")}
                              className="flex items-center hover:text-primary transition-colors"
                            >
                              Joined
                              {getSortIcon("dateJoined")}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : "N/A"}
                            </td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">{user.studentId || "N/A"}</td>
                            <td className="p-4">{getRoleBadge(user.role)}</td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {format(new Date(user.createdAt), "MMM dd, yyyy")}
                            </td>
                            <td className="p-4">
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleRoleChange(user, value)}
                              >
                                <SelectTrigger 
                                  className="w-[140px]" 
                                  data-testid={`select-role-${user.id}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem 
                                    value="student"
                                    disabled={user.role === "admin"}
                                  >
                                    Student
                                  </SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Role Change</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to change the role for{" "}
                    <strong>
                      {userToUpdate?.firstName && userToUpdate?.lastName
                        ? `${userToUpdate.firstName} ${userToUpdate.lastName}`
                        : userToUpdate?.email}
                    </strong>{" "}
                    from <strong>{userToUpdate?.role}</strong> to <strong>{newRole}</strong>?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This action will be logged in the audit trail.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfirmDialogOpen(false);
                      setUserToUpdate(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmRoleChange}
                    disabled={updateRoleMutation.isPending}
                    data-testid="button-confirm-role-change"
                  >
                    {updateRoleMutation.isPending ? "Updating..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

