const pool = require('../config/db');

const getOrCreate = async (phone) => {
  const result = await pool.query(
    'SELECT * FROM sessions WHERE phone = $1',
    [phone]
  );

  if (result.rows.length === 0) {
    await pool.query(
      'INSERT INTO sessions (phone, messages) VALUES ($1, $2)',
      [phone, JSON.stringify([])]
    );
    return {
      phone,
      messages: [],
      leadCaptured: false,
      bookingDone: false,
      needsHuman: false
    };
  }

  const row = result.rows[0];
  return {
    phone: row.phone,
    messages: row.messages,
    leadCaptured: row.lead_captured,
    bookingDone: row.booking_done,
    needsHuman: row.needs_human
  };
};

const save = async (phone, session) => {
  await pool.query(
    `UPDATE sessions SET 
      messages = $1,
      lead_captured = $2,
      booking_done = $3,
      needs_human = $4,
      updated_at = NOW()
    WHERE phone = $5`,
    [
      JSON.stringify(session.messages),
      session.leadCaptured,
      session.bookingDone,
      session.needsHuman,
      phone
    ]
  );
};

const getAll = async () => {
  const result = await pool.query('SELECT * FROM sessions');
  return result.rows;
};

module.exports = { getOrCreate, save, getAll };