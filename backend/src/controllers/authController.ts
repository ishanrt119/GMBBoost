import { Request, Response } from 'express';
import { signupUser, loginUser, signToken } from '../services/authService';
import { createProfile, getProfileByUserId } from '../database/queries';
import { verifyEmail } from '../services/emailVerification.service';
import supabaseAdmin from '../config/supabase';

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, full_name } = req.body;

    // ── Real email verification ───────────────────────────────────────────
    console.log(`[Signup] Verifying email: ${email}`);
    const emailCheck = await verifyEmail(email);
    console.log(`[Signup] Email check result:`, emailCheck);

    if (!emailCheck.valid || !emailCheck.deliverable) {
      res.status(400).json({
        success: false,
        message: emailCheck.reason || 'Please enter a real, deliverable email address.',
        code: emailCheck.disposable ? 'DISPOSABLE_EMAIL' : 'INVALID_EMAIL',
      });
      return;
    }

    // ── Create Supabase user ──────────────────────────────────────────────
    const { user, token, needsVerification } = await signupUser(email, password, full_name);

    // ── Create profile ────────────────────────────────────────────────────
    let profile = null;
    if (!needsVerification) {
      try {
        profile = await getProfileByUserId(user.id);
        if (!profile) profile = await createProfile(user.id, user.email!);
      } catch (err) {
        console.warn('[Signup] Profile create warning:', err);
      }
    }

    if (needsVerification) {
      // Don't issue JWT — user must verify email first
      res.status(201).json({
        success: true,
        message: 'Account created. Please check your email to verify your account.',
        data: {
          token: '',
          user: { id: user.id, email: user.email },
          profile: null,
          needsVerification: true,
        },
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: { id: user.id, email: user.email },
        profile,
        needsVerification: false,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed.';
    console.error('[Signup] Error:', message);
    if (message.toLowerCase().includes('already')) {
      res.status(409).json({ success: false, message, code: 'ACCOUNT_EXISTS' });
      return;
    }
    res.status(400).json({ success: false, message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);

    let profile = null;
    try {
      profile = await getProfileByUserId(user.id);
      if (!profile) profile = await createProfile(user.id, user.email!);
    } catch (err) {
      console.warn('[Login] Profile warning:', err);
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: { id: user.id, email: user.email },
        profile: profile ?? {
          user_id: user.id, credits: 50, full_name: null,
          business_name: null, business_type: null,
          credits_last_refill: new Date().toISOString(), plan: 'free',
        },
        needsVerification: false,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed.';
    res.status(401).json({ success: false, message });
  }
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      res.status(400).json({ success: false, message: 'No access token provided.' });
      return;
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(access_token);
    if (error || !user) {
      res.status(401).json({ success: false, message: 'Invalid OAuth session.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email! });

    let profile = null;
    try {
      profile = await getProfileByUserId(user.id);
      if (!profile) {
        const { data } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            credits: 50,
            credits_last_refill: new Date().toISOString(),
            plan: 'free',
          })
          .select()
          .single();
        profile = data;
      }
    } catch (err) {
      console.warn('[GoogleCallback] Profile warning:', err);
    }

    res.status(200).json({
      success: true,
      message: 'Google login successful.',
      data: {
        token,
        user: { id: user.id, email: user.email },
        profile: profile ?? {
          user_id: user.id, credits: 50,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          business_name: null, business_type: null,
          credits_last_refill: new Date().toISOString(), plan: 'free',
        },
        needsVerification: false,
      },
    });
  } catch (err) {
    console.error('[GoogleCallback] Error:', err);
    res.status(500).json({ success: false, message: 'Google authentication failed.' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
}
