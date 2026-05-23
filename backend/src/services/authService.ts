import jwt from 'jsonwebtoken';
import ws from 'ws';
import { createClient } from '@supabase/supabase-js';
import supabaseAdmin from '../config/supabase';
import { AuthTokenPayload } from '../types';
import dotenv from 'dotenv';
dotenv.config();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return secret;
}

export function signToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) || '7d',
  });
}

// Regular anon client — triggers Supabase email verification
// Must pass ws transport for Node.js < 22
const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    realtime: { transport: ws },
  }
);

export async function signupUser(email: string, password: string, fullName?: string) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || '' },
      emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      throw new Error('An account with this email already exists.');
    }
    throw new Error(error.message);
  }

  if (!data.user) throw new Error('Failed to create user account.');

  const needsVerification = !data.session;
  const token = needsVerification
    ? ''
    : signToken({ userId: data.user.id, email: data.user.email! });

  return { user: data.user, token, needsVerification };
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error('Please verify your email before signing in. Check your inbox.');
    }
    throw new Error('Invalid email or password.');
  }

  if (!data.user) throw new Error('Login failed.');

  if (!data.user.email_confirmed_at) {
    throw new Error('Please verify your email before signing in. Check your inbox.');
  }

  const token = signToken({ userId: data.user.id, email: data.user.email! });
  return { user: data.user, token };
}

export async function updatePassword(userId: string, newPassword: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) throw new Error(`Failed to update password: ${error.message}`);
}
