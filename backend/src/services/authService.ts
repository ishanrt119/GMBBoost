import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  business?: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      business: data.business
    }
  });

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      business: user.business
    }
  };
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      business: user.business
    }
  };
};

export const deleteUser = async (userId: number) => {
  await prisma.review.deleteMany({
    where: { userId: userId }
  });
  return await prisma.user.delete({
    where: { id: userId }
  });
};