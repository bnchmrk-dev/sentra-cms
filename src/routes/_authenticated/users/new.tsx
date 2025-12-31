import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useCreateUser, useCompanies } from "../../../hooks";
import { Card, Button, Input, Alert, Select } from "../../../components/ui";
import { PageHeader } from "../../../components/layout";
import type { UserRole } from "../../../schemas";

export const Route = createFileRoute("/_authenticated/users/new")({
  component: NewUserPage,
});

function NewUserPage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const { data: companiesData, isLoading: companiesLoading } = useCompanies();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [companyId, setCompanyId] = useState("");

  const companies = companiesData?.companies || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !companyId) return;

    try {
      const result = await createUser.mutateAsync({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role,
        companyId,
      });
      // Navigate to the new user's detail page
      navigate({ to: "/users/$userId", params: { userId: result.user.id } });
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
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
        title="Add User"
        description="Create a new user account and assign them to a company."
      />

      <Card variant="default" padding="lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
          <div className="w-16 h-16 rounded-xl bg-accent-subtle flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              User Details
            </h2>
            <p className="text-sm text-text-muted">
              Enter the user information below.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@company.com"
            autoFocus
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Company
            </label>
            <Select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              disabled={companiesLoading}
              required
            >
              <option value="">Select a company...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Role
            </label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="user">User - Basic access</option>
              <option value="admin">Admin - Dashboard access</option>
              <option value="superadmin">Super Admin - Full CMS access</option>
            </Select>
          </div>

          {createUser.error && (
            <Alert variant="error">{createUser.error.message}</Alert>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <Link to="/users">
              <Button variant="ghost" disabled={createUser.isPending}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={createUser.isPending}
              disabled={!email.trim() || !companyId}
            >
              Create User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

