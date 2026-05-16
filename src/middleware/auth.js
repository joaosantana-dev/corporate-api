const jwt = require('jsonwebtoken')

/**
 * Verifica o Bearer token no header Authorization.
 * Popula req.user com o payload decodificado.
 */
function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente ou malformado' })
  }

  const token = auth.slice(7)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    res.status(401).json({ error: message })
  }
}

/**
 * Restringe o acesso a determinados roles.
 * Deve ser usado APÓS authenticate.
 *
 * Exemplo: router.get('/', authenticate, authorize('admin', 'tecnico'), handler)
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    next()
  }
}

module.exports = { authenticate, authorize }
