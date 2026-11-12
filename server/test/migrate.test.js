import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { migrateDatabase } from '../src/db/migrate.js'

function createPool({ failOnMigration = false } = {}) {
  const calls = []
  let released = false
  const client = {
    async query(sql) {
      calls.push(sql)
      if (failOnMigration && sql.includes('ALTER TABLE study_sessions')) {
        throw new Error('migration failed')
      }
    },
    release() {
      released = true
    },
  }

  return {
    calls,
    connect: async () => client,
    get released() {
      return released
    },
  }
}

describe('database migrations', () => {
  it('runs the end-time migration in a locked transaction', async () => {
    const pool = createPool()
    await migrateDatabase(pool)

    assert.equal(pool.calls[0], 'BEGIN')
    assert.match(pool.calls[1], /pg_advisory_xact_lock/)
    assert.match(pool.calls[2], /ADD COLUMN IF NOT EXISTS end_time TIME/)
    assert.match(pool.calls[2], /UPDATE study_sessions/)
    assert.match(pool.calls[2], /session_ends_after_start/)
    assert.equal(pool.calls.at(-1), 'COMMIT')
    assert.equal(pool.released, true)
  })

  it('rolls back and releases the connection when a migration fails', async () => {
    const pool = createPool({ failOnMigration: true })

    await assert.rejects(migrateDatabase(pool), /migration failed/)
    assert.equal(pool.calls.at(-1), 'ROLLBACK')
    assert.equal(pool.released, true)
  })
})
