import { DateTime } from 'luxon'
import { HttpContext } from '@adonisjs/core/http'
import { Get, Group, Middleware, Post, Put, Delete } from '@adonisjs-community/girouette'
import { middleware } from '#start/kernel'

import {
  createWorkloadPlanValidator,
  updateWorkloadPlanValidator,
} from '../validators/workload_plan.js'
import WorkloadPlanTransformer from '../transformers/workload_plan_transformer.js'
import WorkloadPlan from '../models/workload_plan.js'

@Group({ name: 'workload.plans' })
export default class WorkloadPlansController {
  @Get('/workload-plans')
  @Middleware(middleware.auth())
  async index({ serialize }: HttpContext) {
    const plans = await WorkloadPlan.query()
    return await serialize(plans.map((plan) => WorkloadPlanTransformer.transform(plan)))
  }

  @Post('/workload-plans')
  @Middleware(middleware.auth())
  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createWorkloadPlanValidator)
    const plan = await WorkloadPlan.create({
      ...payload,
      periodStart: DateTime.fromJSDate(payload.periodStart),
      periodEnd: DateTime.fromJSDate(payload.periodEnd),
    })
    return await serialize(WorkloadPlanTransformer.transform(plan))
  }

  @Get('/workload-plans/:id')
  @Middleware(middleware.auth())
  async show({ params, serialize }: HttpContext) {
    const plan = await WorkloadPlan.query().where('id', params.id).firstOrFail()
    return await serialize(WorkloadPlanTransformer.transform(plan))
  }

  @Put('/workload-plans/:id')
  @Middleware(middleware.auth())
  async update({ params, request, serialize }: HttpContext) {
    const plan = await WorkloadPlan.findOrFail(params.id)
    const payload = await request.validateUsing(updateWorkloadPlanValidator)

    const updateData: any = { ...payload }
    if (payload.periodStart) {
      updateData.periodStart = DateTime.fromJSDate(payload.periodStart)
    }
    if (payload.periodEnd) {
      updateData.periodEnd = DateTime.fromJSDate(payload.periodEnd)
    }

    plan.merge(updateData)
    await plan.save()

    return await serialize(WorkloadPlanTransformer.transform(plan))
  }

  @Delete('/workload-plans/:id')
  @Middleware(middleware.auth())
  async destroy({ params, response }: HttpContext) {
    const plan = await WorkloadPlan.findOrFail(params.id)
    await plan.delete()
    return response.noContent()
  }
}
