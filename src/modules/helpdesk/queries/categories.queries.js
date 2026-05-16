const db = require('../../../config/database')

const TABLE = 'helpdesk_categories'

function list() {
  return db(TABLE)
    .select('helpdesk_categories.*')
    .count('helpdesk_tickets.id as ticket_count')
    .leftJoin('helpdesk_tickets', 'helpdesk_tickets.category_id', 'helpdesk_categories.id')
    .groupBy('helpdesk_categories.id')
    .orderBy('helpdesk_categories.name', 'asc')
}

function findById(id) {
  return db(TABLE).where({ id }).first()
}

function findByName(name) {
  return db(TABLE).whereILike('name', name).first()
}

async function create({ name, description, color }) {
  const [id] = await db(TABLE).insert({ name, description, color })
  return findById(id)
}

async function update(id, data) {
  await db(TABLE).where({ id }).update({ ...data, updated_at: db.fn.now() })
  return findById(id)
}

function remove(id) {
  return db(TABLE).where({ id }).delete()
}

module.exports = { list, findById, findByName, create, update, remove }
