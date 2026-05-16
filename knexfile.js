require('dotenv').config()

/** @type {import('knex').Knex.Config} */
const base = {
  migrations: { directory: './src/database/migrations' },
  seeds:      { directory: './src/database/seeds' },
}

module.exports = {
  development: {
    ...base,
    client: 'sqlite3',
    connection: { filename: './data/dev.sqlite3' },
    useNullAsDefault: true,
  },

  test: {
    ...base,
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  },

  /**
   * Para trocar de banco em produção, basta alterar DB_CLIENT e as variáveis
   * correspondentes no .env. Clientes suportados pelo Knex:
   *   pg | mysql2 | mssql | oracledb
   *
   * Exemplo .env para PostgreSQL:
   *   DB_CLIENT=pg
   *   DB_HOST=localhost
   *   DB_PORT=5432
   *   DB_NAME=corporate
   *   DB_USER=postgres
   *   DB_PASSWORD=secret
   */
  production: {
    ...base,
    client: process.env.DB_CLIENT || 'pg',
    connection: {
      host:     process.env.DB_HOST,
      port:     Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: { min: 2, max: 10 },
  },
}
