import { BaseTransformer } from '@adonisjs/core/transformers'

import type WorkloadItem from '../models/workload_item.js'

export default class WorkloadItemTransformer extends BaseTransformer<WorkloadItem> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'workloadPlanId',
        'resourceId',
        'project',
        'scope',
        'task',
        'estimatedDays',
        'weeklyAllocations',
        'deliveryDates',
        'createdAt',
        'updatedAt',
      ]),
      consumedDays: this.resource.consumedDays,
      progressPercent: this.resource.progressPercent,
      remainingDays: this.resource.remainingDays,
    }
  }
}
