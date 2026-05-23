const pool = require('../config/db');

// Save lead as soon as name is received
const saveOrUpdate = async (phone, name, interest = 'Unknown') => {
  // Check if lead exists
  const existing = await pool.query(
    'SELECT * FROM leads WHERE phone = $1',
    [phone]
  );

  if (existing.rows.length === 0) {
    // Create new lead with whatever we have
    const result = await pool.query(
      `INSERT INTO leads (phone, name, interest, source, status)
       VALUES ($1, $2, $3, 'WhatsApp', 'New') RETURNING *`,
      [phone, name, interest]
    );
    console.log('✅ Lead created:', result.rows[0]);
    return result.rows[0];
  } else {
    // Update existing lead if interest is now known
    if (interest !== 'Unknown') {
      const result = await pool.query(
        `UPDATE leads SET 
          name = $1,
          interest = $2
        WHERE phone = $3 RETURNING *`,
        [name, interest, phone]
      );
      console.log('✅ Lead updated:', result.rows[0]);
      return result.rows[0];
    }
    return existing.rows[0];
  }
};

const extractAndSave = async (phone, messages) => {
  const allReplies = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .join('\n');

  const match = allReplies.match(/LEAD_CAPTURED::name=(.+?)\|\|interest=(.+)/);

  if (match) {
    const name = match[1].trim();
    const interest = match[2].trim();

    if (!name || name === '<name>' || name.length < 2) {
      console.log(`⚠️ Lead not saved — name missing for ${phone}`);
      return null;
    }

    return await saveOrUpdate(phone, name, interest);
  }

  // Check if just name is available from conversation
  const allMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n');

  const nameMatch = allReplies.match(/NAME_RECEIVED::name=(.+?)(?:\n|$)/);
  if (nameMatch) {
    const name = nameMatch[1].trim();
    if (name && name.length >= 2) {
      return await saveOrUpdate(phone, name, 'Unknown');
    }
  }

  return null;
};

const getAllLeads = async () => {
  const result = await pool.query(
    'SELECT * FROM leads ORDER BY created_at DESC'
  );
  return result.rows;
};

module.exports = { extractAndSave, saveOrUpdate, getAllLeads };