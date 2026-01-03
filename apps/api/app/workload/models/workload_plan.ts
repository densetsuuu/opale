import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { WithPrimaryUuid } from '#core/mixins/with_uuid_pk'
import { WithTimestamps } from '#core/mixins/with_timestamps'

export default class WorkloadPlan extends compose(BaseModel, WithTimestamps, WithPrimaryUuid) {
  @column() declare name: string
  @column() declare userId: string
  @column.date() declare periodStart: DateTime
  @column.date() declare periodEnd: DateTime
  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare deliveryStages: string[]

  get weekCount(): number {
    const start = this.periodStart.startOf('week')
    const end = this.periodEnd.endOf('week')
    return Math.ceil(end.diff(start, 'weeks').weeks)
  }

  getWeeks(): string[] {
    const weeks: string[] = []
    let current = this.periodStart.startOf('week')
    const end = this.periodEnd.endOf('week')

    while (current <= end) {
      weeks.push(current.toFormat("kkkk-'W'WW"))
      current = current.plus({ weeks: 1 })
    }

    return weeks
  }
}
