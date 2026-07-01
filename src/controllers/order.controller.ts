import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const createOrderSchema = z.object({
  shippingAddress: z.string(),
  phone: z.string(),
});

export async function createOrder(req: Request, res: Response) {
  const { shippingAddress, phone } = createOrderSchema.parse(req.body);
  const userId = req.user!.userId;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${item.product.name}`,
      });
    }
  }

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        shippingAddress,
        phone,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  res.status(201).json(order);
}

export async function getOrders(req: Request, res: Response) {
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === "ADMIN";

  const where = isAdmin ? {} : { userId };
  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
}

export async function getOrder(req: Request, res: Response) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
  });

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
    return res.status(403).json({ message: "Not authorized" });
  }

  res.json(order);
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { status } = z.object({ status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]) }).parse(req.body);
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ message: "Order not found" });

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: { include: { product: true } } },
  });

  res.json(updated);
}
