/**
 * Middleware global de tratamento de erros.
 * Deve ser registrado por último em app.js.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Erros de validação (lançados manualmente com status 400)
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message })
  }

  // Violação de unique constraint (sqlite / pg)
  if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado' })
  }

  console.error('[ERROR]', err.message || err)
  res.status(500).json({ error: 'Erro interno do servidor' })
}

/**
 * Cria um erro HTTP com status e mensagem customizados.
 * Uso: throw httpError(400, 'Campo obrigatório')
 */
function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}

module.exports = { errorHandler, httpError }
