const db = require('../../../config/database')

const TABLE = 'helpdesk_users'
const PUBLIC_FIELDS = ['id', 'name', 'email', 'role', 'department', 'status', 'created_at']

function list({ status, role, page = 1, limit = 20 }) {
  const query = db(TABLE).select(PUBLIC_FIELDS)
  if (status) query.where({ status })
  if (role)   query.where({ role })
  return query.orderBy('name', 'asc').limit(limit).offset((page - 1) * limit)
}

function findById(id) {
  return db(TABLE).where({ id }).select(PUBLIC_FIELDS).first()
}

function findByEmail(email) {
  return db(TABLE).where({ email }).select(PUBLIC_FIELDS).first()
}

async function create({ name, email, password_hash, role, department }) {
  const [id] = await db(TABLE).insert({ name, email, password_hash, role, department })
  return findById(id)
}

async function update(id, data) {
  await db(TABLE).where({ id }).update({ ...data, updated_at: db.fn.now() })
  return findById(id)
}

function remove(id) {
  return db(TABLE).where({ id }).delete()
}

module.exports = { list, findById, findByEmail, create, update, remove }
