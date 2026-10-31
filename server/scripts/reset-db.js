import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pool from '../src/db/pool.js'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set before resetting the database.')
}

const resetSqlPath = new URL('../db/reset.sql', import.meta.url)
const resetSql = await readFile(fileURLToPath(resetSqlPath), 'utf8')

try {
  await pool.query(resetSql)
  console.log('StudyPot database schema and sample data have been reset.')
} finally {
  await pool.end()
}
