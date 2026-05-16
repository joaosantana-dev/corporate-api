const crypto = require('crypto')
const db = require('../../../config/database')

const TABLE_USERS  = 'helpdesk_users'
const TABLE_TOKENS = 'helpdesk_refresh_tokens'

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function findByEmail(email) {
  return db(TABLE_USERS)
    .where({ email })
    .select('id', 'name', 'email', 'password_hash', 'role', 'status')
    .first()
}

async function saveRefreshToken(userId, token, expiresAt) {
  await db(TABLE_TOKENS).insert({
    user_id:    userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  })
}

async function findRefreshToken(token) {
  return db(TABLE_TOKENS)
    .where({ token_hash: hashToken(token) })
    .where('expires_at', '>', new Date())
    .join(TABLE_USERS, `${TABLE_TOKENS}.user_id`, `${TABLE_USERS}.id`)
    .select(
      `${TABLE_TOKENS}.id as token_id`,
      `${TABLE_TOKENS}.user_id`,
      `${TABLE_TOKENS}.expires_at`,
      `${TABLE_USERS}.name`,
      `${TABLE_USERS}.email`,
      `${TABLE_USERS}.role`,
      `${TABLE_USERS}.status`,
    )
    .first()
}

async function deleteRefreshToken(token) {
  return db(TABLE_TOKENS).where({ token_hash: hashToken(token) }).delete()
}

async function deleteAllUserTokens(userId) {
  return db(TABLE_TOKENS).where({ user_id: userId }).delete()
}

// ── Password reset ────────────────────────────────────────────────────────────

async function createPasswordReset(email, token, expiresAt) {
  await db('helpdesk_password_resets').where({ email }).whereNull('used_at').delete()
  await db('helpdesk_password_resets').insert({
    email,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  })
}

async function findPasswordReset(token) {
  return db('helpdesk_password_resets')
    .where({ token_hash: hashToken(token) })
    .whereNull('used_at')
    .where('expires_at', '>', new Date())
    .first()
}

async function consumePasswordReset(token) {
  return db('helpdesk_password_resets')
    .where({ token_hash: hashToken(token) })
    .update({ used_at: new Date() })
}

async function updatePassword(email, passwordHash) {
  return db(TABLE_USERS).where({ email }).update({ password_hash: passwordHash })
}

module.exports = {
  findByEmail,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
  createPasswordReset,
  findPasswordReset,
  consumePasswordReset,
  updatePassword,
}
