import { test } from '@japa/runner'

import WorkloadItem from '../../../app/workload/models/workload_item.js'

test.group('WorkloadItem - Model', () => {
  test('consumedDays calculates sum of weekly allocations', ({ assert }) => {
    const item = new WorkloadItem()
    item.weeklyAllocations = {
      '2026-W01': 3,
      '2026-W02': 5,
      '2026-W03': 2,
    }

    assert.equal(item.consumedDays, 10)
  })

  test('consumedDays returns 0 for empty allocations', ({ assert }) => {
    const item = new WorkloadItem()
    item.weeklyAllocations = {}

    assert.equal(item.consumedDays, 0)
  })

  test('progressPercent calculates correct percentage', ({ assert }) => {
    const item = new WorkloadItem()
    item.estimatedDays = 20
    item.weeklyAllocations = {
      '2026-W01': 5,
      '2026-W02': 5,
    }

    assert.equal(item.progressPercent, 50)
  })

  test('progressPercent returns 0 when estimatedDays is 0', ({ assert }) => {
    const item = new WorkloadItem()
    item.estimatedDays = 0
    item.weeklyAllocations = {
      '2026-W01': 5,
    }

    assert.equal(item.progressPercent, 0)
  })

  test('remainingDays calculates correct remaining days', ({ assert }) => {
    const item = new WorkloadItem()
    item.estimatedDays = 15
    item.weeklyAllocations = {
      '2026-W01': 5,
      '2026-W02': 3,
    }

    assert.equal(item.remainingDays, 7)
  })

  test('remainingDays returns 0 when consumed exceeds estimated', ({ assert }) => {
    const item = new WorkloadItem()
    item.estimatedDays = 5
    item.weeklyAllocations = {
      '2026-W01': 5,
      '2026-W02': 5,
    }

    assert.equal(item.remainingDays, 0)
  })
})
