import { HttpContext } from '@adonisjs/core/http'
import { Get, Group, Middleware, Post, Put, Delete } from '@adonisjs-community/girouette'
import { middleware } from '#start/kernel'

import {
  createWorkloadItemValidator,
  updateWorkloadItemValidator,
} from '../validators/workload_item.js'
import WorkloadItemTransformer from '../transformers/workload_item_transformer.js'
import WorkloadItem from '../models/workload_item.js'

@Group({ name: 'workload.items' })
export default class WorkloadItemsController {
  @Get('/workload-items')
  @Middleware(middleware.auth())
  async index({ request, serialize }: HttpContext) {
    const workloadPlanId = request.qs().workloadPlanId
    const query = WorkloadItem.query()

    if (workloadPlanId) {
      query.where('workload_plan_id', workloadPlanId)
    }

    const items = await query
    return await serialize(items.map((item) => WorkloadItemTransformer.transform(item)))
  }

  @Post('/workload-items')
  @Middleware(middleware.auth())
  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createWorkloadItemValidator)
    const item = await WorkloadItem.create(payload)
    return await serialize(WorkloadItemTransformer.transform(item))
  }

  @Get('/workload-items/:id')
  @Middleware(middleware.auth())
  async show({ params, serialize }: HttpContext) {
    const item = await WorkloadItem.query().where('id', params.id).firstOrFail()
    return await serialize(WorkloadItemTransformer.transform(item))
  }

  @Put('/workload-items/:id')
  @Middleware(middleware.auth())
  async update({ params, request, serialize }: HttpContext) {
    const item = await WorkloadItem.findOrFail(params.id)
    const payload = await request.validateUsing(updateWorkloadItemValidator)

    item.merge(payload)
    await item.save()

    return await serialize(WorkloadItemTransformer.transform(item))
  }

  @Delete('/workload-items/:id')
  @Middleware(middleware.auth())
  async destroy({ params, response }: HttpContext) {
    const item = await WorkloadItem.findOrFail(params.id)
    await item.delete()
    return response.noContent()
  }
}
