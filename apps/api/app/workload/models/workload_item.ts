import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import WorkloadPlan from '#workload/models/workload_plan'
import User from '#identity/models/user'
import { WithPrimaryUuid } from '#core/mixins/with_uuid_pk'
import { WithTimestamps } from '#core/mixins/with_timestamps'

export default class WorkloadItem extends compose(BaseModel, WithTimestamps, WithPrimaryUuid) {
  @column() declare workloadPlanId: string
  @column() declare resourceId: string | null
  @column() declare project: string
  @column() declare scope: string
  @column() declare task: string
  @column() declare estimatedDays: number
  @column({
    prepare: (value: Record<string, number>) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare weeklyAllocations: Record<string, number>

  @column({
    prepare: (value: Record<string, string>) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare deliveryDates: Record<string, string>

  @belongsTo(() => WorkloadPlan)
  declare plan: BelongsTo<typeof WorkloadPlan>

  @belongsTo(() => User, { foreignKey: 'resourceId' })
  declare resource: BelongsTo<typeof User>

  get consumedDays(): number {
    return Object.values(this.weeklyAllocations).reduce((sum, days) => sum + days, 0)
  }

  get progressPercent(): number {
    if (this.estimatedDays === 0) return 0
    return Math.round((this.consumedDays / this.estimatedDays) * 100)
  }

  get remainingDays(): number {
    return Math.max(0, this.estimatedDays - this.consumedDays)
  }
}
