// src/controllers/customer.controller.js
const { parse }  = require('csv-parse/sync');
const { prisma } = require('../utils/prisma');

const normalisePhone = (p) => p ? '+' + p.replace(/[^\d]/g, '') : null;
const mapChannel = (ch = '') => ({ whatsapp:'WHATSAPP', email:'EMAIL', sms:'SMS' })[ch.toLowerCase()] || 'WHATSAPP';

exports.uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file required' });

    const records = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
    const businessId = req.user.businessId;
    const result = { imported: 0, duplicates: 0, invalid: 0, rows: [] };

    for (const row of records) {
      const firstName = row.first_name || row.FirstName || row.name || row.Name || '';
      const phone     = normalisePhone(row.phone || row.Phone || row.mobile || row.Mobile || '');
      const email     = (row.email || row.Email || '').toLowerCase().trim() || null;

      if (!firstName || (!phone && !email)) { result.invalid++; continue; }

      const dupQuery = [];
      if (phone) dupQuery.push({ businessId, phone });
      if (email) dupQuery.push({ businessId, email });

      const existing = await prisma.customer.findFirst({ where: { OR: dupQuery } });

      if (existing) {
        result.duplicates++;
        result.rows.push({ firstName, phone, email, _status: 'duplicate' });
        continue;
      }

      const customer = await prisma.customer.create({
        data: {
          businessId, firstName,
          lastName:  row.last_name || row.LastName || null,
          phone:     phone || null,
          email,
          service:   row.service   || row.Service   || null,
          visitDate: row.visit_date ? new Date(row.visit_date) : null,
          channel:   mapChannel(row.channel),
          source:    'CSV',
        },
      });

      result.imported++;
      result.rows.push({ firstName, phone, email, _status: 'clean', id: customer.id });
    }

    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email, service, visitDate, channel } = req.body;
    const businessId = req.user.businessId;

    const normPhone = normalisePhone(phone);
    const normEmail = email?.toLowerCase().trim() || null;

    const dupQuery = [];
    if (normPhone) dupQuery.push({ businessId, phone: normPhone });
    if (normEmail) dupQuery.push({ businessId, email: normEmail });

    if (dupQuery.length) {
      const existing = await prisma.customer.findFirst({ where: { OR: dupQuery } });
      if (existing)
        return res.status(409).json({ success: false, message: 'Customer already exists' });
    }

    const customer = await prisma.customer.create({
      data: {
        businessId, firstName,
        lastName:  lastName || null,
        phone:     normPhone,
        email:     normEmail,
        service:   service  || null,
        visitDate: visitDate ? new Date(visitDate) : null,
        channel:   mapChannel(channel),
        source:    'MANUAL',
      },
    });

    res.status(201).json({ success: true, customer });
  } catch (err) { next(err); }
};

exports.listCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, channel } = req.query;
    const businessId = req.user.businessId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      businessId,
      ...(channel && { channel }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { phone:     { contains: search } },
          { email:     { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where }),
    ]);

    res.json({ success: true, customers, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};
