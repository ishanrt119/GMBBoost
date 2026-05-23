import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types';
import supabaseAdmin from '../config/supabase';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No authentication token provided.', code: 'NO_TOKEN' });
    return;
  }

  const token = authHeader.split(' ')[1];

  let payload: AuthTokenPayload;
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    payload = jwt.verify(token, secret) as AuthTokenPayload;
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.', code: 'INVALID_TOKEN' });
    return;
  }

  // Verify user actually exists in Supabase Auth
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(payload.userId);

    if (error || !data.user) {
      res.status(401).json({
        success: false,
        message: 'This account no longer exists. Please create a new account to continue.',
        code: 'USER_NOT_FOUND',
      });
      return;
    }
  } catch {
    res.status(401).json({
      success: false,
      message: 'Could not verify your account. Please log in again.',
      code: 'AUTH_ERROR',
    });
    return;
  }

  req.user = payload;
  next();
}
