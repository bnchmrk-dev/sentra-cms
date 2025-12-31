import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Globe,
  Trash2,
  Plus,
  Users,
  Loader2,
  Save,
  Clock,
} from "lucide-react";
import {
  useCompany,
  useUpdateCompany,
  useDeleteCompany,
  useAddDomain,
  useRemoveDomain,
} from "../../../hooks";
import {
  Card,
  Button,
  Input,
  Alert,
  Badge,
  IconButton,
  ConfirmModal,
  TimezoneSelect,
} from "../../../components/ui";
import { PageHeader } from "../../../components/layout";
import type { Domain } from "../../../schemas";

export const Route = createFileRoute("/_authenticated/companies/$companyId")({
  component: CompanyDetailPage,
});

function CompanyDetailPage() {
  const { companyId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useCompany(companyId);
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const addDomain = useAddDomain();
  const removeDomain = useRemoveDomain();

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTimezone, setIsEditingTimezone] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [removingDomain, setRemovingDomain] = useState<Domain | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form when data loads
  const company = data?.company;
  if (company && !isEditing && name !== company.name) {
    setName(company.name);
  }
  if (company && !isEditingTimezone && timezone !== company.timezone) {
    setTimezone(company.timezone || "UTC");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </Link>
        </div>
        <Alert variant="error" title="Error loading company">
          {error?.message || "Company not found"}
        </Alert>
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim() || name === company.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateCompany.mutateAsync({ id: companyId, data: { name } });
      setIsEditing(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveTimezone = async () => {
    if (timezone === company.timezone) {
      setIsEditingTimezone(false);
      return;
    }

    try {
      await updateCompany.mutateAsync({ id: companyId, data: { timezone } });
      setIsEditingTimezone(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    try {
      await addDomain.mutateAsync({
        companyId,
        data: { domain: newDomain.toLowerCase() },
      });
      setNewDomain("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleRemoveDomain = async () => {
    if (!removingDomain) return;

    try {
      await removeDomain.mutateAsync({
        companyId,
        domainId: removingDomain.id,
      });
      setRemovingDomain(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCompany.mutateAsync(companyId);
      navigate({ to: "/companies" });
    } catch {
      // Error handled by mutation
    }
  };

  const hasUsers = (company._count?.users || 0) > 0;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>
      </div>

      <PageHeader
        title={company.name}
        description={`Created on ${new Date(company.createdAt).toLocaleDateString()}`}
      />

      {/* Company Details */}
      <Card variant="default" padding="lg" className="mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
          <div className="w-16 h-16 rounded-xl bg-accent-subtle flex items-center justify-center">
            <Building2 className="w-8 h-8 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text-primary">
              Company Details
            </h2>
            <p className="text-sm text-text-muted">
              Manage company information and settings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              <Users className="w-3 h-3 mr-1" />
              {company._count?.users || 0} users
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Company Name
            </label>
            {isEditing ? (
              <div className="flex gap-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Company name"
                  autoFocus
                />
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={updateCompany.isPending}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setName(company.name);
                    setIsEditing(false);
                  }}
                  disabled={updateCompany.isPending}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border-subtle">
                <span className="text-text-primary font-medium">{company.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              <Clock className="w-4 h-4 inline mr-2" />
              Organization Timezone
            </label>
            {isEditingTimezone ? (
              <div className="space-y-3">
                <TimezoneSelect
                  value={timezone}
                  onChange={setTimezone}
                  label=""
                />
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleSaveTimezone}
                    isLoading={updateCompany.isPending}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setTimezone(company.timezone || "UTC");
                      setIsEditingTimezone(false);
                    }}
                    disabled={updateCompany.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border-subtle">
                <span className="text-text-primary font-medium">{company.timezone || "UTC"}</span>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingTimezone(true)}>
                  Edit
                </Button>
              </div>
            )}
          </div>

          {updateCompany.error && (
            <Alert variant="error">{updateCompany.error.message}</Alert>
          )}
        </div>
      </Card>

      {/* Domains Section */}
      <Card variant="default" padding="lg" className="mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
          <div className="w-12 h-12 rounded-lg bg-accent-subtle flex items-center justify-center">
            <Globe className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text-primary">
              Authorized Domains
            </h2>
            <p className="text-sm text-text-muted">
              Users with these email domains can sign up under this company.
            </p>
          </div>
        </div>

        {/* Add Domain Form */}
        <form onSubmit={handleAddDomain} className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. acme.com"
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={addDomain.isPending}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Domain
          </Button>
        </form>

        {addDomain.error && (
          <Alert variant="error" className="mb-4">
            {addDomain.error.message}
          </Alert>
        )}

        {/* Domain List */}
        {company.domains.length === 0 ? (
          <div className="text-center py-8 text-text-muted rounded-lg bg-bg-elevated border border-border-subtle">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No domains added yet</p>
            <p className="text-sm mt-1">Add a domain to allow users to sign up</p>
          </div>
        ) : (
          <div className="space-y-2">
            {company.domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border-subtle"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-text-muted" />
                  <span className="text-text-primary font-medium">
                    {domain.domain}
                  </span>
                </div>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setRemovingDomain(domain)}
                  className="text-status-error hover:bg-status-error-bg"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Danger Zone */}
      <Card variant="default" padding="lg" className="border-status-error/30">
        <h2 className="text-lg font-semibold text-status-error mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-text-muted mb-4">
          Deleting a company will remove all associated domains. Users will not be deleted but will no longer be associated with this company.
        </p>
        <Button
          variant="danger"
          leftIcon={<Trash2 className="w-4 h-4" />}
          onClick={() => setShowDeleteConfirm(true)}
          disabled={hasUsers}
        >
          {hasUsers ? `Cannot delete (${company._count?.users} users)` : "Delete Company"}
        </Button>
        {hasUsers && (
          <p className="text-xs text-text-muted mt-2">
            Remove all users from this company before deleting.
          </p>
        )}
      </Card>

      {/* Remove Domain Confirmation */}
      <ConfirmModal
        isOpen={!!removingDomain}
        onClose={() => setRemovingDomain(null)}
        onConfirm={handleRemoveDomain}
        title="Remove Domain"
        description={`Are you sure you want to remove "${removingDomain?.domain}"? Users with this email domain won't be able to sign up anymore.`}
        confirmText="Remove Domain"
        isLoading={removeDomain.isPending}
      />

      {/* Delete Company Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Company"
        description={`Are you sure you want to delete "${company.name}"? This action cannot be undone.`}
        confirmText="Delete Company"
        isLoading={deleteCompany.isPending}
      />
    </div>
  );
}

