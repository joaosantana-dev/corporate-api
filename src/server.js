require('dotenv').config()

const app = require('./app')
const db  = require('./config/database')

const PORT = process.env.PORT || 3333

async function bootstrap() {
  try {
    await db.raw('SELECT 1')
    console.log('✓ Banco de dados conectado')

    app.listen(PORT, () => {
      console.log(`✓ Servidor em execução → http://localhost:${PORT}`)
      console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (err) {
    console.error('✗ Falha ao iniciar:', err.message)
    process.exit(1)
  }
}

bootstrap()
