import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Plus, Globe, Trash2, Users, Loader2, ChevronRight } from "lucide-react";
import { useCompanies, useDeleteCompany } from "../../../hooks";
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
} from "../../../components/ui";
import { PageHeader } from "../../../components/layout";
import type { Company } from "../../../schemas";

export const Route = createFileRoute("/_authenticated/companies/")({
  component: CompaniesPage,
});

function CompaniesPage() {
  const { data, isLoading, error } = useCompanies();
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading companies">
        {error.message}
      </Alert>
    );
  }

  const companies = data?.companies || [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Companies"
        description="Manage companies and their authorized domains."
        action={
          <Link to="/companies/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Company
            </Button>
          </Link>
        }
      />

      {companies.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No companies yet
          </h3>
          <p className="text-text-muted mb-4">
            Create your first company to start managing user access.
          </p>
          <Link to="/companies/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Company
            </Button>
          </Link>
        </Card>
      ) : (
        <Card variant="default" padding="none">
          <Table>
            <TableHeader>
              <TableHead>Company</TableHead>
              <TableHead>Domains</TableHead>
              <TableHead align="center">Users</TableHead>
              <TableHead align="right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Link
                      to="/companies/$companyId"
                      params={{ companyId: company.id }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary group-hover:text-accent transition-colors">
                          {company.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          Created{" "}
                          {new Date(company.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {company.domains.length === 0 ? (
                        <span className="text-text-muted text-sm">
                          No domains
                        </span>
                      ) : (
                        company.domains.slice(0, 3).map((domain) => (
                          <Badge key={domain.id} variant="default">
                            {domain.domain}
                          </Badge>
                        ))
                      )}
                      {company.domains.length > 3 && (
                        <Badge variant="default">
                          +{company.domains.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="w-4 h-4 text-text-muted" />
                      <span className="text-text-secondary">
                        {company._count?.users || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/companies/$companyId"
                        params={{ companyId: company.id }}
                      >
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
                        onClick={() => setDeleteTarget(company)}
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

      {/* Delete Confirmation */}
      <DeleteCompanyModal
        company={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// Delete Company Modal
interface DeleteCompanyModalProps {
  company: Company | null;
  onClose: () => void;
}

function DeleteCompanyModal({ company, onClose }: DeleteCompanyModalProps) {
  const deleteCompany = useDeleteCompany();

  if (!company) return null;

  const handleDelete = async () => {
    try {
      await deleteCompany.mutateAsync(company.id);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  const hasUsers = (company._count?.users || 0) > 0;

  return (
    <ConfirmModal
      isOpen={!!company}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Company"
      description={
        hasUsers
          ? `Cannot delete "${company.name}" because it has ${company._count?.users} active user(s). Remove all users first.`
          : `Are you sure you want to delete "${company.name}"? This will also remove all associated domains.`
      }
      confirmText={hasUsers ? "OK" : "Delete Company"}
      confirmVariant={hasUsers ? "primary" : "danger"}
      isLoading={deleteCompany.isPending}
    />
  );
}

