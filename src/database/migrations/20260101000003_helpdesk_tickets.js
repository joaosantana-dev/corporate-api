exports.up = async (knex) => {
  await knex.schema.createTable('helpdesk_tickets', (t) => {
    t.increments('id').primary()
    t.string('title', 255).notNullable()
    t.text('description')
    t.integer('category_id').unsigned().references('id').inTable('helpdesk_categories').onDelete('SET NULL')
    t.enu('priority', ['critica', 'alta', 'media', 'baixa']).notNullable().defaultTo('media')
    t.enu('status', ['aberto', 'em_atendimento', 'aguardando', 'resolvido', 'fechado']).notNullable().defaultTo('aberto')
    t.integer('user_id').unsigned().notNullable().references('id').inTable('helpdesk_users').onDelete('CASCADE')
    t.integer('tech_id').unsigned().references('id').inTable('helpdesk_users').onDelete('SET NULL')
    t.string('sla', 20)
    t.timestamps(true, true)
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('helpdesk_tickets')
}
