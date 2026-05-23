import dotenv from 'dotenv';
dotenv.config();

export interface EmailVerificationResult {
  valid: boolean;
  deliverable: boolean;
  is_disposable: boolean;
  is_role_email: boolean;
  reason: string;
  quality_score: number;
}

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'fakeinbox.com', 'sharklasers.com', 'yopmail.com', 'trashmail.com',
  'dispostable.com', 'mailnull.com', 'spamgourmet.com', 'spam4.me',
  'maildrop.cc', 'getairmail.com', 'filzmail.com', 'throwam.com',
  'tempr.email', 'discard.email', 'spamgourmet.org', 'trashmail.org',
  'mailnesia.com', 'spambox.us', 'mailexpire.com', 'spamevader.com',
  'tempinbox.com', 'spamfree24.org', 'mailfreeonline.com', 'owlpic.com',
  'getnada.com', 'trbvm.com', 'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf',
  'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr',
]);

const ROLE_PREFIXES = new Set([
  'admin', 'support', 'info', 'contact', 'help', 'sales', 'noreply',
  'no-reply', 'hello', 'team', 'office', 'hr', 'billing', 'accounts',
]);

// Real DNS/MX lookup via dns-over-https (no API key needed)
async function checkMXRecord(domain: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${domain}&type=MX`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return true; // assume valid if DNS lookup fails
    const data = await res.json();
    // Status 0 = NOERROR, Status 3 = NXDOMAIN (domain doesn't exist)
    if (data.Status === 3) return false; // domain does not exist
    // Check if MX records exist
    const hasMX = data.Answer?.some((r: { type: number }) => r.type === 15);
    // If no MX records, check for A record (some domains use A records for mail)
    if (!hasMX) {
      const aRes = await fetch(
        `https://dns.google/resolve?name=${domain}&type=A`,
        { signal: AbortSignal.timeout(3000) }
      );
      const aData = await aRes.json();
      return aData.Status === 0 && aData.Answer?.length > 0;
    }
    return hasMX;
  } catch {
    return true; // network error — don't block signup
  }
}

export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  if (!email || typeof email !== 'string') {
    return { valid: false, deliverable: false, is_disposable: false, is_role_email: false, reason: 'No email provided', quality_score: 0 };
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 1. Format check
  if (!emailRegex.test(sanitized)) {
    return { valid: false, deliverable: false, is_disposable: false, is_role_email: false, reason: 'Invalid email format', quality_score: 0 };
  }

  const [localPart, domain] = sanitized.split('@');
  const tld = domain.split('.').pop() || '';

  // 2. TLD check
  if (tld.length < 2 || tld.length > 6 || !/^[a-z]+$/.test(tld)) {
    return { valid: false, deliverable: false, is_disposable: false, is_role_email: false, reason: 'Invalid domain extension', quality_score: 0 };
  }

  // 3. Disposable domain check
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, deliverable: false, is_disposable: true, is_role_email: false, reason: 'Disposable email addresses are not allowed', quality_score: 0 };
  }

  // 4. Real DNS MX record check — does this domain actually receive email?
  const hasMX = await checkMXRecord(domain);
  if (!hasMX) {
    return {
      valid: false,
      deliverable: false,
      is_disposable: false,
      is_role_email: false,
      reason: `The domain "${domain}" does not appear to accept emails`,
      quality_score: 0,
    };
  }

  // 5. Role-based check
  const isRole = ROLE_PREFIXES.has(localPart);

  // 6. Optional: Abstract API for deeper SMTP verification
  const abstractKey = process.env.ABSTRACT_EMAIL_API_KEY;
  if (abstractKey) {
    try {
      const res = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${abstractKey}&email=${encodeURIComponent(sanitized)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.is_disposable_email?.value === true) {
          return { valid: false, deliverable: false, is_disposable: true, is_role_email: false, reason: 'Disposable email addresses are not allowed', quality_score: 0 };
        }
        if (data.deliverability === 'UNDELIVERABLE') {
          return { valid: false, deliverable: false, is_disposable: false, is_role_email: false, reason: 'This email address does not exist', quality_score: 0 };
        }
        return {
          valid: true,
          deliverable: data.deliverability === 'DELIVERABLE',
          is_disposable: false,
          is_role_email: data.is_role_email?.value === true,
          reason: data.deliverability === 'DELIVERABLE' ? 'Email verified and deliverable' : 'Email deliverability uncertain',
          quality_score: Math.round((data.quality_score || 0.7) * 100),
        };
      }
    } catch {
      // Fall through to basic result
    }
  }

  return {
    valid: true,
    deliverable: true,
    is_disposable: false,
    is_role_email: isRole,
    reason: isRole ? 'Role-based email detected — personal email preferred' : 'Email domain verified via DNS',
    quality_score: isRole ? 70 : 90,
  };
}
