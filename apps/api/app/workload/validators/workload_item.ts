import vine from '@vinejs/vine'

export const createWorkloadItemValidator = vine.compile(
  vine.object({
    workloadPlanId: vine.string().uuid(),
    resourceId: vine.string().uuid().nullable(),
    project: vine.string().minLength(1).maxLength(255),
    scope: vine.string().minLength(1).maxLength(255),
    task: vine.string().minLength(1).maxLength(255),
    estimatedDays: vine.number().min(0).max(9999),
    weeklyAllocations: vine.record(vine.number().min(0).max(5)),
    deliveryDates: vine.record(vine.string()),
  }),
)

export const updateWorkloadItemValidator = vine.compile(
  vine.object({
    resourceId: vine.string().uuid().nullable().optional(),
    project: vine.string().minLength(1).maxLength(255).optional(),
    scope: vine.string().minLength(1).maxLength(255).optional(),
    task: vine.string().minLength(1).maxLength(255).optional(),
    estimatedDays: vine.number().min(0).max(9999).optional(),
    weeklyAllocations: vine.record(vine.number().min(0).max(5)).optional(),
    deliveryDates: vine.record(vine.string()).optional(),
  }),
)
