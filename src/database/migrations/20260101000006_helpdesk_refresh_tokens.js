exports.up = async (knex) => {
  await knex.schema.createTable('helpdesk_refresh_tokens', (t) => {
    t.increments('id').primary()
    t.integer('user_id').unsigned().notNullable().references('id').inTable('helpdesk_users').onDelete('CASCADE')
    t.string('token_hash', 64).notNullable().unique()
    t.datetime('expires_at').notNullable()
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('helpdesk_refresh_tokens')
}
