import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../lib/api'
import {
  usersResponseSchema,
  userResponseSchema,
  messageResponseSchema,
  type UsersResponse,
  type UserResponse,
  type UpdateUserRoleInput,
  type CreateUserInput,
} from '../schemas'

const USERS_KEY = ['users']

export function useUsers(filters?: { companyId?: string; role?: string }) {
  const api = useApi()

  const queryParams = new URLSearchParams()
  if (filters?.companyId) queryParams.set('companyId', filters.companyId)
  if (filters?.role) queryParams.set('role', filters.role)

  const queryString = queryParams.toString()
  const endpoint = `/api/users${queryString ? `?${queryString}` : ''}`

  return useQuery({
    queryKey: [...USERS_KEY, filters],
    queryFn: () =>
      api.get<UsersResponse>(endpoint, undefined, usersResponseSchema),
  })
}

export function useUser(id: string | undefined) {
  const api = useApi()

  return useQuery({
    queryKey: [...USERS_KEY, id],
    queryFn: () =>
      api.get<UserResponse>(`/api/users/${id}`, undefined, userResponseSchema),
    enabled: !!id,
  })
}

export function useUpdateUserRole() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRoleInput }) =>
      api.patch<UserResponse>(
        `/api/users/${id}/role`,
        data,
        undefined,
        userResponseSchema,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export function useDeleteUser() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/users/${id}`, undefined, messageResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export function useCreateUser() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      api.post<UserResponse>('/api/users', data, undefined, userResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}
