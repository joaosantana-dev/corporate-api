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

async function weekly() {
  const ptDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { dateStr: d.toISOString().split('T')[0], dia: ptDays[d.getDay()] }
  })

  const [opened, resolved] = await Promise.all([
    db('helpdesk_tickets')
      .whereRaw("date(created_at) >= date('now', '-6 days')")
      .select(db.raw("date(created_at) as date_str"))
      .count('id as total')
      .groupByRaw("date(created_at)"),
    db('helpdesk_tickets')
      .whereIn('status', ['resolvido', 'fechado'])
      .whereRaw("date(updated_at) >= date('now', '-6 days')")
      .select(db.raw("date(updated_at) as date_str"))
      .count('id as total')
      .groupByRaw("date(updated_at)"),
  ])

  const openMap = Object.fromEntries(opened.map(r => [r.date_str, Number(r.total)]))
  const resMap  = Object.fromEntries(resolved.map(r => [r.date_str, Number(r.total)]))

  return days.map(({ dateStr, dia }) => ({
    dia,
    abertos:    openMap[dateStr]  || 0,
    resolvidos: resMap[dateStr]   || 0,
  }))
}

async function monthly() {
  const ptMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    return { monthStr: d.toISOString().slice(0, 7), mes: ptMonths[d.getMonth()] }
  })

  const [opened, resolved] = await Promise.all([
    db('helpdesk_tickets')
      .whereRaw("strftime('%Y-%m', created_at) >= strftime('%Y-%m', date('now', '-5 months'))")
      .select(db.raw("strftime('%Y-%m', created_at) as month_str"))
      .count('id as total')
      .groupByRaw("strftime('%Y-%m', created_at)"),
    db('helpdesk_tickets')
      .whereIn('status', ['resolvido', 'fechado'])
      .whereRaw("strftime('%Y-%m', updated_at) >= strftime('%Y-%m', date('now', '-5 months'))")
      .select(db.raw("strftime('%Y-%m', updated_at) as month_str"))
      .count('id as total')
      .groupByRaw("strftime('%Y-%m', updated_at)"),
  ])

  const openMap = Object.fromEntries(opened.map(r => [r.month_str, Number(r.total)]))
  const resMap  = Object.fromEntries(resolved.map(r => [r.month_str, Number(r.total)]))

  return months.map(({ monthStr, mes }) => ({
    mes,
    abertos:    openMap[monthStr]  || 0,
    resolvidos: resMap[monthStr]   || 0,
  }))
}

module.exports = { summary, byCategory, byPriority, byTechnician, weekly, monthly }
