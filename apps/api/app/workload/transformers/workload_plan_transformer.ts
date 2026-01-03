import { BaseTransformer } from '@adonisjs/core/transformers'

import type WorkloadPlan from '../models/workload_plan.js'

export default class WorkloadPlanTransformer extends BaseTransformer<WorkloadPlan> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'userId',
        'periodStart',
        'periodEnd',
        'deliveryStages',
        'createdAt',
        'updatedAt',
      ]),
      weekCount: this.resource.weekCount,
      weeks: this.resource.getWeeks(),
    }
  }
}
