import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
}

export async function getCategory(req: Request, res: Response) {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: { products: { include: { category: true } } },
  });
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json(category);
}
