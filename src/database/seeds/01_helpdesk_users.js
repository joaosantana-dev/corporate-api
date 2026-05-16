const bcrypt = require('bcryptjs')

exports.seed = async (knex) => {
  await knex('helpdesk_users').del()

  const hash = await bcrypt.hash('123456', 10)

  await knex('helpdesk_users').insert([
    { id: 1, name: 'João Admin',    email: 'admin@empresa.com',    password_hash: hash, role: 'admin',   department: 'TI',        status: 'ativo' },
    { id: 2, name: 'Maria Técnica', email: 'tecnico@empresa.com',  password_hash: hash, role: 'tecnico', department: 'TI',        status: 'ativo' },
    { id: 3, name: 'Carlos Usuário',email: 'usuario@empresa.com',  password_hash: hash, role: 'usuario', department: 'Comercial', status: 'ativo' },
    { id: 4, name: 'Ana Silva',     email: 'ana@empresa.com',      password_hash: hash, role: 'usuario', department: 'Financeiro',status: 'ativo' },
    { id: 5, name: 'Pedro Santos',  email: 'pedro@empresa.com',    password_hash: hash, role: 'usuario', department: 'RH',        status: 'inativo' },
    { id: 6, name: 'Lucia Pereira', email: 'lucia@empresa.com',    password_hash: hash, role: 'tecnico', department: 'TI',        status: 'ativo' },
  ])
}
