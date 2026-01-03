import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '../../../app/identity/models/user.js'

test.group('WorkloadPlans API', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /workload-plans creates a plan', async ({ client, assert }: any) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    const response = await client
      .post('/workload-plans')
      .json({
        name: 'Plan Q1 2026',
        userId: user.id,
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        deliveryStages: ['Liv. SFD', 'MEP'],
      })
      .loginAs(user)

    response.assertStatus(200)
    assert.properties(response.body(), ['id', 'name', 'weekCount', 'weeks'])
    assert.equal(response.body().name, 'Plan Q1 2026')
    assert.isArray(response.body().weeks)
    assert.isNotEmpty(response.body().weeks)
  })

  test('GET /workload-plans returns list of plans', async ({ client, assert }: any) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    const response = await client.get('/workload-plans').loginAs(user)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('GET /workload-plans/:id returns a single plan', async ({ client, assert }: any) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    const createResponse = await client
      .post('/workload-plans')
      .json({
        name: 'Test Plan',
        userId: user.id,
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
        deliveryStages: ['Stage 1'],
      })
      .loginAs(user)

    const planId = createResponse.body().id

    const response = await client.get(`/workload-plans/${planId}`).loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().id, planId)
    assert.equal(response.body().name, 'Test Plan')
  })

  test('PUT /workload-plans/:id updates a plan', async ({ client, assert }: any) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    const createResponse = await client
      .post('/workload-plans')
      .json({
        name: 'Original Name',
        userId: user.id,
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
        deliveryStages: [],
      })
      .loginAs(user)

    const planId = createResponse.body().id

    const response = await client
      .put(`/workload-plans/${planId}`)
      .json({
        name: 'Updated Name',
      })
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().name, 'Updated Name')
  })

  test('DELETE /workload-plans/:id deletes a plan', async ({ client }: any) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    const createResponse = await client
      .post('/workload-plans')
      .json({
        name: 'To Delete',
        userId: user.id,
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
        deliveryStages: [],
      })
      .loginAs(user)

    const planId = createResponse.body().id

    const response = await client.delete(`/workload-plans/${planId}`).loginAs(user)

    response.assertStatus(204)

    const getResponse = await client.get(`/workload-plans/${planId}`).loginAs(user)
    getResponse.assertStatus(404)
  })

  test('POST /workload-plans validates periodEnd after periodStart', async ({ client }: any) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    const response = await client
      .post('/workload-plans')
      .json({
        name: 'Invalid Plan',
        userId: user.id,
        periodStart: '2026-03-31',
        periodEnd: '2026-01-01',
        deliveryStages: [],
      })
      .loginAs(user)

    response.assertStatus(422)
  })
})
