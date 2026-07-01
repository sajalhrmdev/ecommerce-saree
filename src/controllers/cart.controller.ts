import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

export async function getCart(req: Request, res: Response) {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.userId },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  res.json(cart);
}

export async function addToCart(req: Request, res: Response) {
  const { productId, quantity } = z
    .object({ productId: z.string(), quantity: z.number().int().positive() })
    .parse(req.body);

  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { product: true },
    });
    return res.json(updated);
  }

  const item = await prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity },
    include: { product: true },
  });

  res.status(201).json(item);
}

export async function updateCartItem(req: Request, res: Response) {
  const { quantity } = z.object({ quantity: z.number().int().positive() }).parse(req.body);
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ message: "Item not found" });

  const updated = await prisma.cartItem.update({
    where: { id: req.params.id },
    data: { quantity },
    include: { product: true },
  });
  res.json(updated);
}

export async function removeCartItem(req: Request, res: Response) {
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ message: "Item not found" });
  await prisma.cartItem.delete({ where: { id: req.params.id } });
  res.json({ message: "Item removed" });
}
