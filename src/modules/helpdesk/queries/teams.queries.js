const db = require('../../../config/database')

/**
 * Lista todos os técnicos com suas especialidades e métricas agregadas.
 */
function listTechnicians() {
  return db('helpdesk_users as u')
    .whereIn('u.role', ['admin', 'tecnico'])
    .where('u.status', 'ativo')
    .select(
      'u.id',
      'u.name',
      'u.email',
      'u.department',
      db.raw(`(
        SELECT COUNT(*) FROM helpdesk_tickets
        WHERE tech_id = u.id AND status NOT IN ('resolvido', 'fechado')
      ) as open_tickets`),
      db.raw(`(
        SELECT COUNT(*) FROM helpdesk_tickets
        WHERE tech_id = u.id AND status IN ('resolvido', 'fechado')
      ) as resolved_tickets`),
    )
    .orderBy('u.name', 'asc')
}

/**
 * Retorna as especialidades (categorias) de um técnico.
 */
function getTechSpecialties(userId) {
  return db('helpdesk_tech_specialties as ts')
    .join('helpdesk_categories as c', 'ts.category_id', 'c.id')
    .where('ts.user_id', userId)
    .select('c.id', 'c.name', 'c.color')
}

/**
 * Atualiza as especialidades de um técnico (substitui completamente).
 */
async function setSpecialties(userId, categoryIds) {
  await db('helpdesk_tech_specialties').where({ user_id: userId }).delete()
  if (categoryIds.length) {
    await db('helpdesk_tech_specialties').insert(
      categoryIds.map((category_id) => ({ user_id: userId, category_id }))
    )
  }
  return getTechSpecialties(userId)
}

module.exports = { listTechnicians, getTechSpecialties, setSpecialties }
