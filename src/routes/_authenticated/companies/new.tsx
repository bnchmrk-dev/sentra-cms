import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { useCreateCompany } from "../../../hooks";
import { Card, Button, Input, Alert, TimezoneSelect } from "../../../components/ui";
import { PageHeader } from "../../../components/layout";

export const Route = createFileRoute("/_authenticated/companies/new")({
  component: NewCompanyPage,
});

function NewCompanyPage() {
  const navigate = useNavigate();
  const createCompany = useCreateCompany();
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const result = await createCompany.mutateAsync({ name, timezone });
      // Navigate to the new company's detail page
      navigate({ to: "/companies/$companyId", params: { companyId: result.company.id } });
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
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
        title="Create Company"
        description="Add a new company to manage user access."
      />

      <Card variant="default" padding="lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
          <div className="w-16 h-16 rounded-xl bg-accent-subtle flex items-center justify-center">
            <Building2 className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Company Details
            </h2>
            <p className="text-sm text-text-muted">
              Enter the company information below.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Company Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Corporation"
            autoFocus
            required
          />

          <TimezoneSelect
            label="Organization Timezone"
            value={timezone}
            onChange={setTimezone}
          />

          {createCompany.error && (
            <Alert variant="error">{createCompany.error.message}</Alert>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <Link to="/companies">
              <Button variant="ghost" disabled={createCompany.isPending}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={createCompany.isPending}
              disabled={!name.trim()}
            >
              Create Company
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
