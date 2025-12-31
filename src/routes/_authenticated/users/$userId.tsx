import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  User as UserIcon,
  Building2,
  Shield,
  Trash2,
  Loader2,
  Save,
  Mail,
  Calendar,
} from "lucide-react";
import { useUser, useUpdateUserRole, useDeleteUser, useCompany } from "../../../hooks";
import {
  Card,
  Button,
  Alert,
  Badge,
  Select,
  ConfirmModal,
} from "../../../components/ui";
import { PageHeader } from "../../../components/layout";
import type { UserRole } from "../../../schemas";

export const Route = createFileRoute("/_authenticated/users/$userId")({
  component: UserDetailPage,
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

const roleDescriptions: Record<UserRole, string> = {
  user: "Basic access to the learning platform",
  admin: "Can access the admin dashboard and manage content",
  superadmin: "Full access to CMS and all administrative features",
};

function UserDetailPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useUser(userId);
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const user = data?.user;
  const { data: companyData } = useCompany(user?.companyId);

  // Initialize selected role when data loads
  if (user && !selectedRole) {
    setSelectedRole(user.role);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link
            to="/users"
            className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Link>
        </div>
        <Alert variant="error" title="Error loading user">
          {error?.message || "User not found"}
        </Alert>
      </div>
    );
  }

  const handleSaveRole = async () => {
    if (!selectedRole || selectedRole === user.role) return;

    try {
      await updateRole.mutateAsync({ id: userId, data: { role: selectedRole } });
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(userId);
      navigate({ to: "/users" });
    } catch {
      // Error handled by mutation
    }
  };

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email.split("@")[0];

  const hasRoleChanged = selectedRole && selectedRole !== user.role;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
      </div>

      <PageHeader
        title={fullName}
        description={user.email}
      />

      {/* User Profile */}
      <Card variant="default" padding="lg" className="mb-6">
        <div className="flex items-start gap-6 mb-6 pb-6 border-b border-border-subtle">
          <div className="w-20 h-20 rounded-full bg-accent-subtle flex items-center justify-center">
            <span className="text-2xl font-bold text-accent">
              {(user.firstName?.[0] || user.email[0]).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text-primary mb-1">
              {fullName}
            </h2>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Badge variant={roleBadgeVariants[user.role]} dot>
            {roleLabels[user.role]}
          </Badge>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Company
                </p>
                <p className="font-medium text-text-primary">
                  {companyData?.company?.name || user.company?.name || "—"}
                </p>
              </div>
            </div>
            {user.companyId && (
              <Link
                to="/companies/$companyId"
                params={{ companyId: user.companyId }}
                className="text-sm text-accent hover:underline"
              >
                View Company →
              </Link>
            )}
          </div>

          <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Clerk ID
                </p>
                <p className="font-mono text-sm text-text-secondary truncate max-w-[200px]">
                  {user.clerkId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Role Management */}
      <Card variant="default" padding="lg" className="mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
          <div className="w-12 h-12 rounded-lg bg-accent-subtle flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text-primary">
              Access & Permissions
            </h2>
            <p className="text-sm text-text-muted">
              Manage user role and access level.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              User Role
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                >
                  <option value="user">User - Basic access</option>
                  <option value="admin">Admin - Dashboard access</option>
                  <option value="superadmin">Super Admin - Full CMS access</option>
                </Select>
              </div>
              <Button
                variant="primary"
                onClick={handleSaveRole}
                isLoading={updateRole.isPending}
                disabled={!hasRoleChanged}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save
              </Button>
            </div>
          </div>

          {selectedRole && (
            <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
              <p className="text-sm text-text-muted">
                <span className="font-medium text-text-secondary">
                  {roleLabels[selectedRole]}:
                </span>{" "}
                {roleDescriptions[selectedRole]}
              </p>
            </div>
          )}

          {updateRole.error && (
            <Alert variant="error">{updateRole.error.message}</Alert>
          )}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card variant="default" padding="lg" className="border-status-error/30">
        <h2 className="text-lg font-semibold text-status-error mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-text-muted mb-4">
          Deleting a user will remove their account from your database. They will need to sign up again to regain access.
        </p>
        <Button
          variant="danger"
          leftIcon={<Trash2 className="w-4 h-4" />}
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete User
        </Button>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${user.email}? This action cannot be undone.`}
        confirmText="Delete User"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}

