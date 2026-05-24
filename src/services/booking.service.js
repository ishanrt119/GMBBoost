const pool = require('../config/db');

const save = async (phone, details) => {
  const result = await pool.query(
    `INSERT INTO bookings (phone, name, date, time, status)
     VALUES ($1, $2, $3, $4, 'Confirmed') RETURNING *`,
    [phone, details.name, details.date, details.time]
  );
  const booking = result.rows[0];
  console.log('📅 Booking saved to DB:', booking);
  return booking;
};

const getAll = async () => {
  const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
  return result.rows;
};

module.exports = { save, getAll };