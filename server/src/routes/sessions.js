import { Router } from 'express'

const editableFields = [
  'title',
  'subject',
  'description',
  'session_date',
  'session_time',
  'end_time',
  'location',
]

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/
const END_BEFORE_START_ERROR = 'end_time must be later than session_time'

// "14:00" and "14:00:00" both become "14:00:00", so times compare as strings.
function toFullTime(value) {
  return value.length === 5 ? `${value}:00` : value
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  return date.getUTCFullYear() > 0 &&
    !Number.isNaN(date.valueOf()) &&
    date.toISOString().startsWith(value)
}

function validateSessionFields(fields, { partial = false } = {}) {
  const errors = []
  const requiredFields = ['title', 'subject', 'session_date', 'session_time', 'end_time', 'location']

  for (const field of requiredFields) {
    if (!partial && (typeof fields[field] !== 'string' || !fields[field].trim())) {
      errors.push(`${field} is required`)
    } else if (partial && field in fields && (
      typeof fields[field] !== 'string' || !fields[field].trim()
    )) {
      errors.push(`${field} cannot be empty`)
    }
  }

  for (const field of ['title', 'subject', 'location']) {
    if (typeof fields[field] === 'string') {
      const maxLengths = { title: 150, subject: 100, location: 200 }
      if (fields[field].trim().length > maxLengths[field]) {
        errors.push(`${field} must be ${maxLengths[field]} characters or fewer`)
      }
    }
  }

  if ('description' in fields && fields.description !== null &&
      typeof fields.description !== 'string') {
    errors.push('description must be a string or null')
  }

  if (typeof fields.description === 'string' && fields.description.length > 5000) {
    errors.push('description must be 5000 characters or fewer')
  }

  if ('session_date' in fields && (
    typeof fields.session_date !== 'string' || !isValidDate(fields.session_date)
  )) {
    errors.push('session_date must be a valid date in YYYY-MM-DD format')
  }

  for (const field of ['session_time', 'end_time']) {
    if (field in fields && (typeof fields[field] !== 'string' || !TIME_PATTERN.test(fields[field]))) {
      errors.push(`${field} must be a valid time in HH:MM format`)
    }
  }

  // Sessions start and end on the same day. When only one of the two times is
  // being edited, the database check catches an end before the start.
  if (TIME_PATTERN.test(fields.session_time) && TIME_PATTERN.test(fields.end_time) &&
      toFullTime(fields.end_time) <= toFullTime(fields.session_time)) {
    errors.push(END_BEFORE_START_ERROR)
  }

  return errors
}

function parseId(value) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function normalizeSessionFields(fields) {
  return {
    title: fields.title.trim(),
    subject: fields.subject.trim(),
    description: typeof fields.description === 'string' ? fields.description.trim() : null,
    session_date: fields.session_date,
    session_time: fields.session_time,
    end_time: fields.end_time,
    location: fields.location.trim(),
  }
}

export function createSessionsRouter(pool) {
  const router = Router()

  // Only the student who created a session may edit or delete it.
  // There are no real accounts yet, so the client names its student in the X-Student-Id header.
  async function findHostError(sessionId, request) {
    const studentId = parseId(request.get('x-student-id'))
    if (!studentId) {
      return { status: 401, error: 'Sign in to manage this session' }
    }

    const { rows } = await pool.query(
      'SELECT creator_id FROM study_sessions WHERE id = $1',
      [sessionId],
    )
    if (!rows[0]) {
      return { status: 404, error: 'Study session not found' }
    }
    if (rows[0].creator_id !== studentId) {
      return { status: 403, error: 'Only the host can edit or delete this session' }
    }

    return null
  }

  router.get('/', async (request, response) => {
    const filters = []
    const values = []

    if (typeof request.query.search === 'string' && request.query.search.trim()) {
      values.push(`%${request.query.search.trim()}%`)
      filters.push(`(s.title ILIKE $${values.length} OR s.subject ILIKE $${values.length})`)
    }

    if (typeof request.query.subject === 'string' && request.query.subject.trim()) {
      values.push(request.query.subject.trim())
      filters.push(`s.subject ILIKE $${values.length}`)
    }

    if (request.query.upcoming === 'true') {
      filters.push('s.session_date >= CURRENT_DATE')
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
    const { rows } = await pool.query(
      `SELECT s.*, creator.name AS creator_name,
        (SELECT COUNT(*)::int FROM session_memberships m WHERE m.session_id = s.id)
          AS participant_count
       FROM study_sessions s
       JOIN students creator ON creator.id = s.creator_id
       ${where}
       ORDER BY s.session_date ASC, s.session_time ASC, s.id ASC`,
      values,
    )

    response.json({ sessions: rows })
  })

  router.get('/:id', async (request, response) => {
    const id = parseId(request.params.id)
    if (!id) {
      return response.status(400).json({ error: 'Session id must be a positive integer' })
    }

    const { rows } = await pool.query(
      `SELECT s.*, creator.name AS creator_name,
        COUNT(DISTINCT participant.id)::int AS participant_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', participant.id,
              'name', participant.name,
              'email', participant.email,
              'joined_at', membership.joined_at
            ) ORDER BY participant.name
          ) FILTER (WHERE participant.id IS NOT NULL),
          '[]'::json
        ) AS participants
       FROM study_sessions s
       JOIN students creator ON creator.id = s.creator_id
       LEFT JOIN session_memberships membership ON membership.session_id = s.id
       LEFT JOIN students participant ON participant.id = membership.student_id
       WHERE s.id = $1
       GROUP BY s.id, creator.name`,
      [id],
    )

    if (!rows[0]) {
      return response.status(404).json({ error: 'Study session not found' })
    }

    response.json({ session: rows[0] })
  })

  router.post('/:id/members', async (request, response) => {
    const sessionId = parseId(request.params.id)
    const studentId = parseId(request.body?.student_id)

    if (!sessionId || !studentId) {
      return response.status(400).json({
        error: 'Session id and student_id must be positive integers',
      })
    }

    const session = await pool.query(
      'SELECT id FROM study_sessions WHERE id = $1',
      [sessionId],
    )
    if (!session.rows[0]) {
      return response.status(404).json({ error: 'Study session not found' })
    }

    const student = await pool.query(
      'SELECT id FROM students WHERE id = $1',
      [studentId],
    )
    if (!student.rows[0]) {
      return response.status(404).json({ error: 'Student not found' })
    }

    const membership = await pool.query(
      `INSERT INTO session_memberships (student_id, session_id)
       VALUES ($1, $2)
       ON CONFLICT (student_id, session_id) DO NOTHING
       RETURNING student_id, session_id, joined_at`,
      [studentId, sessionId],
    )

    if (!membership.rows[0]) {
      return response.status(409).json({ error: 'Student has already joined this session' })
    }

    response.status(201).json({ membership: membership.rows[0] })
  })

  router.delete('/:id/members/:studentId', async (request, response) => {
    const sessionId = parseId(request.params.id)
    const studentId = parseId(request.params.studentId)

    if (!sessionId || !studentId) {
      return response.status(400).json({
        error: 'Session id and student id must be positive integers',
      })
    }

    const { rows } = await pool.query(
      `DELETE FROM session_memberships
       WHERE session_id = $1 AND student_id = $2
       RETURNING student_id, session_id`,
      [sessionId, studentId],
    )

    if (!rows[0]) {
      return response.status(404).json({ error: 'Student is not a member of this session' })
    }

    response.status(204).end()
  })

  router.post('/', async (request, response) => {
    const fields = request.body && typeof request.body === 'object' &&
      !Array.isArray(request.body) ? request.body : {}
    const errors = validateSessionFields(fields)
    const creatorId = parseId(fields.creator_id)

    if (!creatorId) {
      errors.push('creator_id must be a positive integer')
    }

    if (errors.length) {
      return response.status(400).json({ error: 'Invalid session data', details: errors })
    }

    const creator = await pool.query(
      'SELECT id FROM students WHERE id = $1',
      [creatorId],
    )
    if (!creator.rows[0]) {
      return response.status(404).json({ error: 'Creator student not found' })
    }

    const normalized = normalizeSessionFields(fields)
    const { rows } = await pool.query(
      `WITH created_session AS (
         INSERT INTO study_sessions
           (creator_id, title, subject, description, session_date, session_time, location, end_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *
       ), creator_membership AS (
         INSERT INTO session_memberships (student_id, session_id)
         SELECT creator_id, id FROM created_session
         RETURNING session_id
       )
       SELECT created_session.*
       FROM created_session
       JOIN creator_membership ON creator_membership.session_id = created_session.id`,
      [
        creatorId,
        normalized.title,
        normalized.subject,
        normalized.description,
        normalized.session_date,
        normalized.session_time,
        normalized.location,
        normalized.end_time,
      ],
    )

    response.status(201).json({ session: rows[0] })
  })

  router.patch('/:id', async (request, response) => {
    const id = parseId(request.params.id)
    if (!id) {
      return response.status(400).json({ error: 'Session id must be a positive integer' })
    }

    const fields = request.body && typeof request.body === 'object' &&
      !Array.isArray(request.body) ? request.body : {}
    const changedFields = editableFields.filter((field) => field in fields)
    if (!changedFields.length) {
      return response.status(400).json({ error: 'Provide at least one editable session field' })
    }

    const errors = validateSessionFields(fields, { partial: true })
    if (errors.length) {
      return response.status(400).json({ error: 'Invalid session data', details: errors })
    }

    const hostError = await findHostError(id, request)
    if (hostError) {
      return response.status(hostError.status).json({ error: hostError.error })
    }

    const values = changedFields.map((field) => (
      field === 'description' && fields[field] === '' ? null :
        typeof fields[field] === 'string' ? fields[field].trim() : fields[field]
    ))
    values.push(id)
    const assignments = changedFields.map(
      (field, index) => `${field} = $${index + 1}`,
    )

    let rows
    try {
      ({ rows } = await pool.query(
        `UPDATE study_sessions SET ${assignments.join(', ')}
         WHERE id = $${values.length}
         RETURNING *`,
        values,
      ))
    } catch (error) {
      if (error.code === '23514' && error.constraint === 'session_ends_after_start') {
        return response.status(400).json({
          error: 'Invalid session data',
          details: [END_BEFORE_START_ERROR],
        })
      }
      throw error
    }

    if (!rows[0]) {
      return response.status(404).json({ error: 'Study session not found' })
    }

    response.json({ session: rows[0] })
  })

  router.delete('/:id', async (request, response) => {
    const id = parseId(request.params.id)
    if (!id) {
      return response.status(400).json({ error: 'Session id must be a positive integer' })
    }

    const hostError = await findHostError(id, request)
    if (hostError) {
      return response.status(hostError.status).json({ error: hostError.error })
    }

    const { rowCount } = await pool.query(
      'DELETE FROM study_sessions WHERE id = $1',
      [id],
    )

    if (!rowCount) {
      return response.status(404).json({ error: 'Study session not found' })
    }

    response.status(204).end()
  })

  return router
}
