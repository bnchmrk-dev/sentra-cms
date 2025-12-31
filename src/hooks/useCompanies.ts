import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../lib/api";
import {
  companiesResponseSchema,
  companyResponseSchema,
  domainResponseSchema,
  messageResponseSchema,
  type CompaniesResponse,
  type CompanyResponse,
  type CreateCompanyInput,
  type UpdateCompanyInput,
  type AddDomainInput,
  type DomainResponse,
} from "../schemas";

const COMPANIES_KEY = ["companies"];

export function useCompanies() {
  const api = useApi();

  return useQuery({
    queryKey: COMPANIES_KEY,
    queryFn: () => api.get<CompaniesResponse>("/api/companies", undefined, companiesResponseSchema),
  });
}

export function useCompany(id: string | undefined) {
  const api = useApi();

  return useQuery({
    queryKey: [...COMPANIES_KEY, id],
    queryFn: () => api.get<CompanyResponse>(`/api/companies/${id}`, undefined, companyResponseSchema),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyInput) =>
      api.post<CompanyResponse>("/api/companies", data, undefined, companyResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
    },
  });
}

export function useUpdateCompany() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyInput }) =>
      api.put<CompanyResponse>(`/api/companies/${id}`, data, undefined, companyResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
    },
  });
}

export function useDeleteCompany() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/companies/${id}`, undefined, messageResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
    },
  });
}

export function useAddDomain() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: AddDomainInput }) =>
      api.post<DomainResponse>(`/api/companies/${companyId}/domains`, data, undefined, domainResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
    },
  });
}

export function useRemoveDomain() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, domainId }: { companyId: string; domainId: string }) =>
      api.delete(`/api/companies/${companyId}/domains/${domainId}`, undefined, messageResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
    },
  });
}

