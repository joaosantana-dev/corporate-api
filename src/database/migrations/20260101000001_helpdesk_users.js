exports.up = async (knex) => {
  await knex.schema.createTable('helpdesk_users', (t) => {
    t.increments('id').primary()
    t.string('name', 120).notNullable()
    t.string('email', 200).notNullable().unique()
    t.string('password_hash', 255).notNullable()
    t.enu('role', ['admin', 'tecnico', 'usuario']).notNullable().defaultTo('usuario')
    t.string('department', 100)
    t.enu('status', ['ativo', 'inativo']).notNullable().defaultTo('ativo')
    t.timestamps(true, true)
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('helpdesk_users')
}
