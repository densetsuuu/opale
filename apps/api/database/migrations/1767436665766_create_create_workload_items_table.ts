import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'workload_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('workload_plan_id')
        .notNullable()
        .references('id')
        .inTable('workload_plans')
        .onDelete('CASCADE')
      table.uuid('resource_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.string('project').notNullable()
      table.string('scope').notNullable()
      table.string('task').notNullable()
      table.decimal('estimated_days', 5, 2).notNullable().defaultTo(0)
      table.jsonb('weekly_allocations').notNullable().defaultTo('{}')
      table.jsonb('delivery_dates').notNullable().defaultTo('{}')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
