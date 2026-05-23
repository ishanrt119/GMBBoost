import { Request, Response } from 'express';
import { verifyEmail } from '../services/emailVerification.service';

export async function checkEmail(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }
    const result = await verifyEmail(email);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email verification failed.';
    res.status(500).json({ success: false, message });
  }
}
