import { Request, Response } from 'express';
import { getProfileByUserId, updateProfile } from '../database/queries';
import { updatePassword } from '../services/authService';
import { body, validationResult } from 'express-validator';

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found.' });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch profile.';
    res.status(500).json({ success: false, message });
  }
}

export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { full_name, business_name, business_type } = req.body;

    const updated = await updateProfile(userId, { full_name, business_name, business_type });

    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile.';
    res.status(500).json({ success: false, message });
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 8) {
      res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
      return;
    }

    await updatePassword(userId, new_password);

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update password.';
    res.status(500).json({ success: false, message });
  }
}
