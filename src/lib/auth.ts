import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { DEV_CONTEXT } from '@/lib/dev-context';

const IS_DEV = process.env.NODE_ENV !== 'production';

export async function requireSuperAdmin(): Promise<
  | { ok: true; userId: string; user: any }
  | { ok: false; response: NextResponse }
> {
  try {
    if (IS_DEV) {
      return { ok: true, userId: DEV_CONTEXT.userId, user: { role: 'SUPER_ADMIN' } };
    }

    await dbConnect();
    const cookieStore = await cookies();
    const userId = cookieStore.get('superAdminUserId')?.value;

    if (!userId) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized: Super admin session required' },
          { status: 401 }
        ),
      };
    }

    const user = await User.findById(userId).lean();

    if (!user || (user as any).role !== 'SUPER_ADMIN') {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden: Insufficient privileges' },
          { status: 403 }
        ),
      };
    }

    return { ok: true, userId, user };
  } catch (error: any) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Server error during auth check' },
        { status: 500 }
      ),
    };
  }
}

export async function requireClient(): Promise<
  | { ok: true; userId: string; user: any }
  | { ok: false; response: NextResponse }
> {
  try {
    if (IS_DEV) {
      return { ok: true, userId: DEV_CONTEXT.userId, user: { role: 'CLIENT', organizationId: DEV_CONTEXT.organizationId } };
    }

    await dbConnect();
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || cookieStore.get('superAdminUserId')?.value;

    if (!userId) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized: Client session required' },
          { status: 401 }
        ),
      };
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden: User not found' },
          { status: 403 }
        ),
      };
    }

    return { ok: true, userId, user };
  } catch (error: any) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Server error during client auth check' },
        { status: 500 }
      ),
    };
  }
}
