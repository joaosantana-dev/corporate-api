exports.up = async (knex) => {
  await knex.schema.createTable('helpdesk_tech_specialties', (t) => {
    t.increments('id').primary()
    t.integer('user_id').unsigned().notNullable().references('id').inTable('helpdesk_users').onDelete('CASCADE')
    t.integer('category_id').unsigned().notNullable().references('id').inTable('helpdesk_categories').onDelete('CASCADE')
    t.unique(['user_id', 'category_id'])
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('helpdesk_tech_specialties')
}
