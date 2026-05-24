import { Request, Response } from 'express';
import { searchBusiness, saveBusinessDataId, getUserProfile } from '../services/businessService';

export const searchBusinessHandler = async (req: Request, res: Response) => {
  try {
    const { businessName } = req.body;
    if (!businessName) {
      return res.status(400).json({ error: 'Business name is required' });
    }
    const results = await searchBusiness(businessName);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const saveBusinessHandler = async (req: Request, res: Response) => {
  try {
    const { userId, dataId, businessName } = req.body;
    if (!userId || !dataId || !businessName) {
      return res.status(400).json({ error: 'userId, dataId and businessName are required' });
    }
    const user = await saveBusinessDataId(userId, dataId, businessName);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const user = await getUserProfile(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsersWithDataId = async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({
      where: { dataId: { not: null } },
      select: { id: true, name: true, dataId: true, business: true }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
