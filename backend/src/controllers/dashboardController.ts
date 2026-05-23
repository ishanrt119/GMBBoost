import { Request, Response } from 'express';
import { getDashboardStats } from '../database/queries';

export async function stats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = await getDashboardStats(userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch dashboard stats.';
    res.status(500).json({ success: false, message });
  }
}
