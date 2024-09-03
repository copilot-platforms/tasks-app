/**
 * `supabase-privilege` helps run the `grant-privileges.sql` query in this directory
 *
 * We are granting privileges to required roles this way, because Supabase for some reason flushes all permissions
 * after each migrate.
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function runSqlScript() {
  const sqlPath = path.resolve(__dirname, 'grant-all-privileges.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const statements = sql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement)

  try {
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement)
    }
    console.info('🔥 grant-privileges executed successfully 🔥')
  } catch (error) {
    console.error('Error executing grant-privileges:', error)
  } finally {
    await prisma.$disconnect()
  }
}

runSqlScript()
