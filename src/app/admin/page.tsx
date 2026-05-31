import { redirect } from 'next/navigation';

// In dev mode, always go straight to dashboard (no real auth)
// In production, middleware/cookie check handles protection
export default function AdminRootPage() {
  redirect('/admin/dashboard');
}
