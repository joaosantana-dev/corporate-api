exports.up = async (knex) => {
  await knex.schema.createTable('helpdesk_categories', (t) => {
    t.increments('id').primary()
    t.string('name', 100).notNullable().unique()
    t.string('description', 255)
    t.string('color', 50).defaultTo('gray')
    t.timestamps(true, true)
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('helpdesk_categories')
}
