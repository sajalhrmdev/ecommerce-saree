import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import prisma from "../lib/prisma";
import { sendOtpEmail } from "../lib/email";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function createAndSendOtp(email: string): Promise<void> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.verificationToken.create({ data: { email, code, expiresAt } });
  await sendOtpEmail(email, code);
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }
  const password = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { ...data, password },
    select: { id: true, email: true, name: true, role: true },
  });
  await prisma.cart.create({ data: { userId: user.id } });
  await createAndSendOtp(user.email);
  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    otpSent: true,
  });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  await createAndSendOtp(user.email);
  res.json({
    otpSent: true,
    email: user.email,
  });
}

export async function verifyOtp(req: Request, res: Response) {
  const schema = z.object({ email: z.string().email(), code: z.string().length(6) });
  const { email, code } = schema.parse(req.body);

  const token = await prisma.verificationToken.findFirst({
    where: { email, code, used: false, expiresAt: { gte: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await prisma.verificationToken.update({
    where: { id: token.id },
    data: { used: true },
  });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const jwtToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ user, token: jwtToken });
}

export async function resendOtp(req: Request, res: Response) {
  const schema = z.object({ email: z.string().email() });
  const { email } = schema.parse(req.body);

  await prisma.verificationToken.updateMany({
    where: { email, used: false },
    data: { used: true },
  });

  await createAndSendOtp(email);
  res.json({ message: "OTP resent" });
}

export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, role: true, phone: true, address: true },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}
