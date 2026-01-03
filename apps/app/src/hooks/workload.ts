import { useMutation, useQuery, useQueryClient, queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/tuyau'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export interface WorkloadPlan {
  id: string
  name: string
  userId: string
  periodStart: string
  periodEnd: string
  deliveryStages: string[]
  weekCount: number
  weeks: string[]
  createdAt: string
  updatedAt: string
}

export interface WorkloadItem {
  id: string
  workloadPlanId: string
  resourceId: string | null
  project: string
  scope: string
  task: string
  estimatedDays: number
  weeklyAllocations: Record<string, number>
  deliveryDates: Record<string, string>
  consumedDays: number
  progressPercent: number
  remainingDays: number
  createdAt: string
  updatedAt: string
}

export const getWorkloadPlansQueryOptions = () => {
  return queryOptions({
    queryKey: ['workload', 'plans'],
    queryFn: async () => {
      const response = await api.get<WorkloadPlan[]>(`${API_BASE}/workload-plans`)
      return response
    },
  })
}

export const getWorkloadPlanQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['workload', 'plans', id],
    queryFn: async () => {
      const response = await api.get<WorkloadPlan>(`${API_BASE}/workload-plans/${id}`)
      return response
    },
  })
}

export const getWorkloadItemsQueryOptions = (workloadPlanId?: string) => {
  return queryOptions({
    queryKey: ['workload', 'items', workloadPlanId],
    queryFn: async () => {
      const url = workloadPlanId
        ? `${API_BASE}/workload-items?workloadPlanId=${workloadPlanId}`
        : `${API_BASE}/workload-items`
      const response = await api.get<WorkloadItem[]>(url)
      return response
    },
  })
}

export const useWorkloadPlans = () => {
  return useQuery(getWorkloadPlansQueryOptions())
}

export const useWorkloadPlan = (id: string) => {
  return useQuery(getWorkloadPlanQueryOptions(id))
}

export const useWorkloadItems = (workloadPlanId?: string) => {
  return useQuery(getWorkloadItemsQueryOptions(workloadPlanId))
}

export const useCreateWorkloadPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      name: string
      userId: string
      periodStart: Date
      periodEnd: Date
      deliveryStages: string[]
    }) => {
      return api.post<WorkloadPlan>(`${API_BASE}/workload-plans`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'plans'] })
    },
  })
}

export const useUpdateWorkloadPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<{
        name: string
        periodStart: Date
        periodEnd: Date
        deliveryStages: string[]
      }>
    }) => {
      return api.put<WorkloadPlan>(`${API_BASE}/workload-plans/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'plans'] })
    },
  })
}

export const useDeleteWorkloadPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`${API_BASE}/workload-plans/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'plans'] })
    },
  })
}

export const useCreateWorkloadItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      workloadPlanId: string
      resourceId: string | null
      project: string
      scope: string
      task: string
      estimatedDays: number
      weeklyAllocations: Record<string, number>
      deliveryDates: Record<string, string>
    }) => {
      return api.post<WorkloadItem>(`${API_BASE}/workload-items`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'items'] })
    },
  })
}

export const useUpdateWorkloadItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<{
        resourceId: string | null
        project: string
        scope: string
        task: string
        estimatedDays: number
        weeklyAllocations: Record<string, number>
        deliveryDates: Record<string, string>
      }>
    }) => {
      return api.put<WorkloadItem>(`${API_BASE}/workload-items/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'items'] })
    },
  })
}

export const useDeleteWorkloadItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`${API_BASE}/workload-items/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'items'] })
    },
  })
}

export const getWorkloadPlanQueryOptions = (id: string) => {
  return query.workload.plans.show.queryOptions({ params: { id } })
}

export const getWorkloadItemsQueryOptions = (workloadPlanId?: string) => {
  return query.workload.items.index.queryOptions({
    query: workloadPlanId ? { workloadPlanId } : {},
  })
}

export const useCreateWorkloadPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      name: string
      userId: string
      periodStart: Date
      periodEnd: Date
      deliveryStages: string[]
    }) => {
      return query.workload.plans.store.mutation({ body: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'plans'] })
    },
  })
}

export const useUpdateWorkloadPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<{
        name: string
        periodStart: Date
        periodEnd: Date
        deliveryStages: string[]
      }>
    }) => {
      return query.workload.plans.update.mutation({
        params: { id },
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'plans'] })
    },
  })
}

export const useDeleteWorkloadPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return query.workload.plans.destroy.mutation({ params: { id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'plans'] })
    },
  })
}

export const useCreateWorkloadItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      workloadPlanId: string
      resourceId: string | null
      project: string
      scope: string
      task: string
      estimatedDays: number
      weeklyAllocations: Record<string, number>
      deliveryDates: Record<string, string>
    }) => {
      return query.workload.items.store.mutation({ body: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'items'] })
    },
  })
}

export const useUpdateWorkloadItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<{
        resourceId: string | null
        project: string
        scope: string
        task: string
        estimatedDays: number
        weeklyAllocations: Record<string, number>
        deliveryDates: Record<string, string>
      }>
    }) => {
      return query.workload.items.update.mutation({
        params: { id },
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'items'] })
    },
  })
}

export const useDeleteWorkloadItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return query.workload.items.destroy.mutation({ params: { id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'items'] })
    },
  })
}
