import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "name"]).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
});

export async function listProducts(req: Request, res: Response) {
  const query = productQuerySchema.parse(req.query);
  const where: any = {};

  if (query.category) {
    where.category = { slug: query.category };
  }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) where.price.gte = query.minPrice;
    if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
  }

  const orderBy: any = {};
  switch (query.sort) {
    case "price_asc": orderBy.price = "asc"; break;
    case "price_desc": orderBy.price = "desc"; break;
    case "name": orderBy.name = "asc"; break;
    default: orderBy.createdAt = "desc";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
}

export async function getProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true },
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
}

export async function getFeaturedProducts(_req: Request, res: Response) {
  const products = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 8,
    include: { category: { select: { name: true, slug: true } } },
  });
  res.json(products);
}

export async function createProduct(req: Request, res: Response) {
  const schema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string(),
    price: z.number().positive(),
    compareAt: z.number().positive().optional(),
    images: z.array(z.string()),
    categoryId: z.string(),
    stock: z.number().int().default(0),
    isFeatured: z.boolean().default(false),
    material: z.string().optional(),
    sizes: z.array(z.string()).default([]),
    colors: z.array(z.string()).default([]),
  });
  const data = schema.parse(req.body);
  const product = await prisma.product.create({ data });
  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ message: "Product not found" });
  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(updated);
}

export async function deleteProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ message: "Product not found" });
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: "Product deleted" });
}
