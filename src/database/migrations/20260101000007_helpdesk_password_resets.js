exports.up = async (knex) => {
  await knex.schema.createTable('helpdesk_password_resets', (t) => {
    t.increments('id')
    t.string('email').notNullable().index()
    t.string('token_hash', 64).notNullable().unique()
    t.datetime('expires_at').notNullable()
    t.datetime('used_at').nullable()
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('helpdesk_password_resets')
}
