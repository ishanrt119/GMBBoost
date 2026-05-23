import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export interface EmailVerificationResult {
  valid: boolean;
  deliverable: boolean;
  disposable: boolean;
  reason: string;
}

interface AbstractAPIResponse {
  email: string;
  autocorrect: string;
  deliverability: string;
  quality_score: string;
  is_valid_format: { value: boolean; text: string };
  is_free_email: { value: boolean; text: string };
  is_disposable_email: { value: boolean; text: string };
  is_role_email: { value: boolean; text: string };
  is_catchall_email: { value: boolean; text: string };
  is_mx_found: { value: boolean; text: string };
  is_smtp_valid: { value: boolean; text: string };
}

export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  const apiKey = process.env.ABSTRACT_EMAIL_API_KEY;

  if (!apiKey) {
    console.warn('[EmailVerification] ABSTRACT_EMAIL_API_KEY not set — skipping API check, using DNS fallback');
    return fallbackVerify(email);
  }

  try {
    console.log(`[EmailVerification] Verifying: ${email}`);

    const response = await axios.get<AbstractAPIResponse>(
      'https://emailvalidation.abstractapi.com/v1/',
      {
        params: { api_key: apiKey, email },
        timeout: 8000,
      }
    );

    const data = response.data;
    console.log('[EmailVerification] Raw API response:', JSON.stringify(data, null, 2));

    // 1. Format check
    if (!data.is_valid_format?.value) {
      return { valid: false, deliverable: false, disposable: false, reason: 'Invalid email format.' };
    }

    // 2. Disposable check
    if (data.is_disposable_email?.value === true) {
      return { valid: false, deliverable: false, disposable: true, reason: 'Disposable or temporary email addresses are not allowed. Please use a real business or personal email.' };
    }

    // 3. MX records check
    if (data.is_mx_found?.value === false) {
      return { valid: false, deliverable: false, disposable: false, reason: `The domain does not have valid mail records. Please check your email address.` };
    }

    // 4. Deliverability check
    if (data.deliverability === 'UNDELIVERABLE') {
      return { valid: false, deliverable: false, disposable: false, reason: 'This email address does not exist or cannot receive emails. Please use a real email address.' };
    }

    if (data.deliverability === 'UNKNOWN') {
      // UNKNOWN means we can't confirm — allow but warn
      console.log('[EmailVerification] Deliverability UNKNOWN — allowing with warning');
      return { valid: true, deliverable: true, disposable: false, reason: 'Email accepted (deliverability unconfirmed).' };
    }

    // 5. DELIVERABLE
    console.log('[EmailVerification] Email passed all checks ✓');
    return { valid: true, deliverable: true, disposable: false, reason: 'Email verified and deliverable.' };

  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('[EmailVerification] Axios error:', err.response?.status, err.response?.data);
      if (err.response?.status === 401) {
        console.error('[EmailVerification] Invalid Abstract API key!');
      }
      if (err.response?.status === 429) {
        console.warn('[EmailVerification] Rate limit hit — falling back to DNS check');
        return fallbackVerify(email);
      }
    } else {
      console.error('[EmailVerification] Unexpected error:', err);
    }
    // On error, fall back to DNS verification rather than blocking all signups
    return fallbackVerify(email);
  }
}

// DNS MX fallback when Abstract API is unavailable
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'fakeinbox.com', 'sharklasers.com', 'yopmail.com', 'trashmail.com',
  'dispostable.com', 'mailnull.com', 'spam4.me', 'maildrop.cc',
  'getnada.com', 'trbvm.com', 'getairmail.com', 'filzmail.com',
  'tempr.email', 'discard.email', 'mailnesia.com', 'spambox.us',
]);

async function fallbackVerify(email: string): Promise<EmailVerificationResult> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, deliverable: false, disposable: false, reason: 'Invalid email format.' };
  }

  const domain = email.split('@')[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, deliverable: false, disposable: true, reason: 'Disposable email addresses are not allowed.' };
  }

  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    console.log(`[EmailVerification] DNS MX for ${domain}:`, data.Status, data.Answer?.length ?? 0, 'records');

    if (data.Status === 3) {
      return { valid: false, deliverable: false, disposable: false, reason: `The domain "${domain}" does not exist.` };
    }
    if (!data.Answer || data.Answer.length === 0) {
      return { valid: false, deliverable: false, disposable: false, reason: `The domain "${domain}" cannot receive emails.` };
    }
  } catch {
    console.warn('[EmailVerification] DNS fallback failed — allowing signup');
  }

  return { valid: true, deliverable: true, disposable: false, reason: 'Email format and domain verified.' };
}
