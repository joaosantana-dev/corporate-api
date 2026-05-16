const db = require('../../../config/database')

const TABLE = 'helpdesk_tickets'

function baseSelect() {
  return db(TABLE)
    .join('helpdesk_users as u',    `${TABLE}.user_id`,    'u.id')
    .join('helpdesk_categories as c', `${TABLE}.category_id`, 'c.id')
    .leftJoin('helpdesk_users as tech', `${TABLE}.tech_id`, 'tech.id')
    .select(
      `${TABLE}.*`,
      'u.name    as user_name',
      'u.email   as user_email',
      'c.name    as category_name',
      'c.color   as category_color',
      'tech.name as tech_name',
    )
}

function applyFilters(query, { userId, role, status, priority, categoryId, search }) {
  if (role === 'usuario') query.where(`${TABLE}.user_id`, userId)
  if (status)     query.where(`${TABLE}.status`,      status)
  if (priority)   query.where(`${TABLE}.priority`,    priority)
  if (categoryId) query.where(`${TABLE}.category_id`, categoryId)
  if (search)     query.whereILike(`${TABLE}.title`, `%${search}%`)
  return query
}

function list({ userId, role, status, priority, categoryId, search, page = 1, limit = 10 }) {
  const query = applyFilters(baseSelect(), { userId, role, status, priority, categoryId, search })
  return query
    .orderBy(`${TABLE}.created_at`, 'desc')
    .limit(limit)
    .offset((page - 1) * limit)
}

async function count({ userId, role, status, priority, categoryId, search }) {
  const query = applyFilters(db(TABLE), { userId, role, status, priority, categoryId, search })
  const row = await query.count(`${TABLE}.id as total`).first()
  return Number(row.total)
}

function findById(id) {
  return baseSelect().where(`${TABLE}.id`, id).first()
}

async function create({ title, description, category_id, priority, sla, user_id }) {
  const [id] = await db(TABLE).insert({ title, description, category_id, priority, sla, user_id })
  return findById(id)
}

async function update(id, data) {
  await db(TABLE).where({ id }).update({ ...data, updated_at: db.fn.now() })
  return findById(id)
}

function remove(id) {
  return db(TABLE).where({ id }).delete()
}

// ── Comentários ────────────────────────────────────────────────────────────
function listComments(ticketId) {
  return db('helpdesk_ticket_comments as tc')
    .join('helpdesk_users as u', 'tc.user_id', 'u.id')
    .where('tc.ticket_id', ticketId)
    .select('tc.*', 'u.name as user_name', 'u.role as user_role')
    .orderBy('tc.created_at', 'asc')
}

async function addComment({ ticket_id, user_id, content, is_internal = false }) {
  const [id] = await db('helpdesk_ticket_comments').insert({ ticket_id, user_id, content, is_internal })
  return db('helpdesk_ticket_comments as tc')
    .join('helpdesk_users as u', 'tc.user_id', 'u.id')
    .where('tc.id', id)
    .select('tc.*', 'u.name as user_name', 'u.role as user_role')
    .first()
}

module.exports = { list, count, findById, create, update, remove, listComments, addComment }
