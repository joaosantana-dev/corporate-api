const db = require('../../../config/database')

/** Totais gerais por status e prioridade. */
function summary() {
  return Promise.all([
    db('helpdesk_tickets').count('id as total').first(),
    db('helpdesk_tickets').where('status', 'aberto').count('id as total').first(),
    db('helpdesk_tickets').where('status', 'em_atendimento').count('id as total').first(),
    db('helpdesk_tickets').whereIn('status', ['resolvido', 'fechado']).count('id as total').first(),
    db('helpdesk_tickets').where('priority', 'critica').whereNotIn('status', ['resolvido', 'fechado']).count('id as total').first(),
  ]).then(([all, open, inProgress, resolved, critical]) => ({
    total:       Number(all.total),
    open:        Number(open.total),
    in_progress: Number(inProgress.total),
    resolved:    Number(resolved.total),
    critical:    Number(critical.total),
  }))
}

/** Contagem de tickets por categoria. */
function byCategory() {
  return db('helpdesk_tickets as t')
    .join('helpdesk_categories as c', 't.category_id', 'c.id')
    .groupBy('c.id', 'c.name', 'c.color')
    .select('c.id', 'c.name', 'c.color')
    .count('t.id as total')
    .orderBy('total', 'desc')
}

/** Contagem de tickets por prioridade. */
function byPriority() {
  return db('helpdesk_tickets')
    .groupBy('priority')
    .select('priority')
    .count('id as total')
    .orderByRaw("CASE priority WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 ELSE 4 END")
}

/** Métricas por técnico. */
function byTechnician() {
  return db('helpdesk_users as u')
    .whereIn('u.role', ['admin', 'tecnico'])
    .select(
      'u.id',
      'u.name',
      db.raw('(SELECT COUNT(*) FROM helpdesk_tickets WHERE tech_id = u.id AND status NOT IN (\'resolvido\', \'fechado\')) as open_tickets'),
      db.raw('(SELECT COUNT(*) FROM helpdesk_tickets WHERE tech_id = u.id AND status IN (\'resolvido\', \'fechado\')) as resolved_tickets'),
    )
    .orderBy('resolved_tickets', 'desc')
}

module.exports = { summary, byCategory, byPriority, byTechnician }
