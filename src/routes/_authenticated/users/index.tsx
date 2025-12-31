import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Users as UsersIcon, Trash2, Loader2, ChevronRight } from "lucide-react";
import { useUsers, useCompanies, useDeleteUser } from "../../../hooks";
import {
  Card,
  Button,
  Badge,
  ConfirmModal,
  Alert,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Select,
  SearchInput,
} from "../../../components/ui";
import { PageHeader } from "../../../components/layout";
import type { User, UserRole } from "../../../schemas";

export const Route = createFileRoute("/_authenticated/users/")({
  component: UsersPage,
});

const roleLabels: Record<UserRole, string> = {
  user: "User",
  admin: "Admin",
  superadmin: "Super Admin",
};

const roleBadgeVariants: Record<UserRole, "default" | "live" | "review"> = {
  user: "default",
  admin: "review",
  superadmin: "live",
};

function UsersPage() {
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companiesData } = useCompanies();
  const { data, isLoading, error } = useUsers({
    companyId: companyFilter || undefined,
    role: roleFilter || undefined,
  });

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading users">
        {error.message}
      </Alert>
    );
  }

  const users = data?.users || [];
  const companies = companiesData?.companies || [];

  // Filter by search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.company?.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Users"
        description="Manage all users and their access levels."
      />

      {/* Filters */}
      <Card variant="default" padding="md" className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
            />
          </div>
          <div className="w-48">
            <Select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-40">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </Select>
          </div>
        </div>
      </Card>

      {filteredUsers.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center py-12">
          <UsersIcon className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No users found
          </h3>
          <p className="text-text-muted">
            {users.length === 0
              ? "No users have signed up yet."
              : "Try adjusting your filters."}
          </p>
        </Card>
      ) : (
        <Card variant="default" padding="none">
          <Table>
            <TableHeader>
              <TableHead>User</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead align="right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link
                      to="/users/$userId"
                      params={{ userId: user.id }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent-subtle flex items-center justify-center">
                        <span className="text-sm font-medium text-accent">
                          {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary group-hover:text-accent transition-colors">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email.split("@")[0]}
                        </p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-text-secondary">
                      {user.company?.name || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariants[user.role]} dot>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-text-muted text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to="/users/$userId" params={{ userId: user.id }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          View
                        </Button>
                      </Link>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => setDeleteTarget(user)}
                        className="text-status-error hover:bg-status-error-bg"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Stats */}
      <div className="mt-6 flex items-center gap-6 text-sm text-text-muted">
        <span>Total: {filteredUsers.length} users</span>
        <span>
          Admins: {filteredUsers.filter((u) => u.role === "admin").length}
        </span>
        <span>
          Super Admins:{" "}
          {filteredUsers.filter((u) => u.role === "superadmin").length}
        </span>
      </div>

      {/* Delete Confirmation */}
      <DeleteUserModal
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// Delete User Modal
interface DeleteUserModalProps {
  user: User | null;
  onClose: () => void;
}

function DeleteUserModal({ user, onClose }: DeleteUserModalProps) {
  const deleteUser = useDeleteUser();

  if (!user) return null;

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(user.id);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <ConfirmModal
      isOpen={!!user}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete User"
      description={`Are you sure you want to delete ${user.email}? This action cannot be undone.`}
      confirmText="Delete User"
      isLoading={deleteUser.isPending}
    />
  );
}

