import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'workload_plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.date('period_start').notNullable()
      table.date('period_end').notNullable()
      table.jsonb('delivery_stages').notNullable().defaultTo('[]')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('user_id')
      table.index(['period_start', 'period_end'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
