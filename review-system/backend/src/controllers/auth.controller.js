// src/controllers/auth.controller.js
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { prisma } = require('../utils/prisma');

const signAccess  = (p) => jwt.sign(p, process.env.JWT_SECRET,           { expiresIn: process.env.JWT_EXPIRES_IN });
const signRefresh = (p) => jwt.sign(p, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });

exports.register = async (req, res, next) => {
  try {
    const { businessName, name, email, password } = req.body;

    if (await prisma.user.findUnique({ where: { email } }))
      return res.status(409).json({ success: false, message: 'Email already in use' });

    const business     = await prisma.business.create({ data: { name: businessName } });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { businessId: business.id, name, email, passwordHash, role: 'ADMIN' },
    });

    const accessToken  = signAccess({ sub: user.id, businessId: business.id, role: user.role });
    const refreshToken = signRefresh({ sub: user.id });

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) },
    });

    res.status(201).json({ success: true, accessToken, refreshToken,
      user: { id: user.id, name, email, businessId: business.id } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken  = signAccess({ sub: user.id, businessId: user.businessId, role: user.role });
    const refreshToken = signRefresh({ sub: user.id });

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) },
    });

    res.json({ success: true, accessToken, refreshToken,
      user: { id: user.id, name: user.name, email, businessId: user.businessId, role: user.role } });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date())
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user    = await prisma.user.findUnique({ where: { id: decoded.sub } });

    const newAccess  = signAccess({ sub: user.id, businessId: user.businessId, role: user.role });
    const newRefresh = signRefresh({ sub: user.id });

    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    await prisma.refreshToken.create({
      data: { userId: user.id, token: newRefresh, expiresAt: new Date(Date.now() + 7*24*60*60*1000) },
    });

    res.json({ success: true, accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { id: true, name: true, email: true, role: true, businessId: true,
                business: { select: { name: true, reviewLink: true, googlePlaceId: true } } },
    });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
