import { DateTime } from 'luxon'
import { test } from '@japa/runner'

import WorkloadPlan from '../../../app/workload/models/workload_plan.js'

test.group('WorkloadPlan - Model', () => {
  test('weekCount calculates correct number of weeks', ({ assert }) => {
    const plan = new WorkloadPlan()
    plan.periodStart = DateTime.fromISO('2026-01-01')
    plan.periodEnd = DateTime.fromISO('2026-03-31')

    assert.isNumber(plan.weekCount)
    assert.isAtLeast(plan.weekCount, 12)
    assert.isAtMost(plan.weekCount, 14)
  })

  test('getWeeks returns array of ISO week strings', ({ assert }) => {
    const plan = new WorkloadPlan()
    plan.periodStart = DateTime.fromISO('2026-01-01')
    plan.periodEnd = DateTime.fromISO('2026-01-31')

    const weeks = plan.getWeeks()

    assert.isArray(weeks)
    assert.isNotEmpty(weeks)
    assert.match(weeks[0], /^\d{4}-W\d{2}$/)
  })

  test('getWeeks returns sequential weeks', ({ assert }) => {
    const plan = new WorkloadPlan()
    plan.periodStart = DateTime.fromISO('2026-01-05')
    plan.periodEnd = DateTime.fromISO('2026-01-25')

    const weeks = plan.getWeeks()

    assert.isAtLeast(weeks.length, 2)
    assert.match(weeks[0], /^2026-W0[1-4]$/)
    assert.match(weeks[weeks.length - 1], /^2026-W0[1-4]$/)
  })
})
