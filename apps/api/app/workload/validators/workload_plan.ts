import vine from '@vinejs/vine'

export const createWorkloadPlanValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(255),
    userId: vine.string().uuid(),
    periodStart: vine.date(),
    periodEnd: vine.date().afterField('periodStart'),
    deliveryStages: vine.array(vine.string().minLength(1).maxLength(100)),
  }),
)

export const updateWorkloadPlanValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(255).optional(),
    periodStart: vine.date().optional(),
    periodEnd: vine.date().afterField('periodStart').optional(),
    deliveryStages: vine.array(vine.string().minLength(1).maxLength(100)).optional(),
  }),
)
