exports.up = async (knex) => {
  await knex.schema.createTable('helpdesk_ticket_comments', (t) => {
    t.increments('id').primary()
    t.integer('ticket_id').unsigned().notNullable().references('id').inTable('helpdesk_tickets').onDelete('CASCADE')
    t.integer('user_id').unsigned().notNullable().references('id').inTable('helpdesk_users').onDelete('CASCADE')
    t.text('content').notNullable()
    t.boolean('is_internal').notNullable().defaultTo(false)
    t.timestamps(true, true)
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('helpdesk_ticket_comments')
}
