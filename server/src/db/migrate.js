import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const endTimeMigrationUrl = new URL(
  '../../db/migrations/001-add-session-end-time.sql',
  import.meta.url,
)

export async function migrateDatabase(pool) {
  const migrationSql = await readFile(fileURLToPath(endTimeMigrationUrl), 'utf8')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(73204110611)')
    await client.query(migrationSql)
    await client.query('COMMIT')
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        'Database migration failed and rollback could not complete',
      )
    }

    throw error
  } finally {
    client.release()
  }
}
