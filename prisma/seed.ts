import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@sareeshop.com" },
    update: {},
    create: {
      email: "admin@sareeshop.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const categories = [
    { name: "Silk Sarees", slug: "silk-sarees", image: "https://images.pexels.com/photos/10317113/pexels-photo-10317113.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "Cotton Sarees", slug: "cotton-sarees", image: "https://images.unsplash.com/photo-1616986491129-3e37cb654c82?w=600" },
    { name: "Banarasi Sarees", slug: "banarasi-sarees", image: "https://images.unsplash.com/photo-1722422284858-3ae70c6b9d9c?w=600" },
    { name: "Georgette Sarees", slug: "georgette-sarees", image: "https://images.pexels.com/photos/28054615/pexels-photo-28054615.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "Chiffon Sarees", slug: "chiffon-sarees", image: "https://images.pexels.com/photos/36134867/pexels-photo-36134867.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "Linen Sarees", slug: "linen-sarees", image: "https://images.pexels.com/photos/15404885/pexels-photo-15404885.jpeg?auto=compress&cs=tinysrgb&w=600" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const silkCat = await prisma.category.findUnique({ where: { slug: "silk-sarees" } });
  const cottonCat = await prisma.category.findUnique({ where: { slug: "cotton-sarees" } });
  const banarasiCat = await prisma.category.findUnique({ where: { slug: "banarasi-sarees" } });

  const products = [
    {
      name: "Kanchipuram Silk Saree",
      slug: "kanchipuram-silk-saree",
      description: "Authentic Kanchipuram silk saree with gold zari work. Handwoven by skilled artisans.",
      price: 12999,
      compareAt: 15999,
      images: [
        "https://images.unsplash.com/photo-1616986491129-3e37cb654c82?w=800",
        "https://images.pexels.com/photos/10317113/pexels-photo-10317113.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      categoryId: silkCat!.id,
      stock: 15,
      isFeatured: true,
      material: "Pure Silk",
      sizes: ["6.3 yards", "5.5 yards"],
      colors: ["Red", "Green", "Blue"],
    },
    {
      name: "Mysore Silk Saree",
      slug: "mysore-silk-saree",
      description: "Elegant Mysore silk saree with subtle gold border. Lightweight and luxurious.",
      price: 8999,
      compareAt: 10999,
      images: [
        "https://images.unsplash.com/photo-1756483492198-8ca91227489b?w=800",
        "https://images.pexels.com/photos/2381469/pexels-photo-2381469.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      categoryId: silkCat!.id,
      stock: 20,
      isFeatured: true,
      material: "Pure Silk",
      sizes: ["6.3 yards"],
      colors: ["Gold", "White", "Pink"],
    },
    {
      name: "Bengal Cotton Saree",
      slug: "bengal-cotton-saree",
      description: "Handwoven Bengal cotton saree with traditional floral print. Perfect for daily wear.",
      price: 2499,
      compareAt: 3299,
      images: [
        "https://images.pexels.com/photos/28054615/pexels-photo-28054615.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      categoryId: cottonCat!.id,
      stock: 50,
      isFeatured: false,
      material: "Pure Cotton",
      sizes: ["6.3 yards", "5.5 yards"],
      colors: ["Blue", "Yellow", "Green"],
    },
    {
      name: "Kota Doria Cotton Saree",
      slug: "kota-doria-cotton-saree",
      description: "Lightweight Kota Doria cotton saree with checkered weave. Ideal for summer.",
      price: 3999,
      images: [
        "https://images.unsplash.com/photo-1742677143629-b9784beab2e1?w=800",
      ],
      categoryId: cottonCat!.id,
      stock: 30,
      isFeatured: true,
      material: "Cotton Blend",
      sizes: ["6.3 yards"],
      colors: ["White", "Beige", "Light Blue"],
    },
    {
      name: "Banarasi Brocade Saree",
      slug: "banarasi-brocade-saree",
      description: "Rich Banarasi brocade saree with intricate floral and paisley motifs.",
      price: 18999,
      compareAt: 22999,
      images: [
        "https://images.unsplash.com/photo-1722422284858-3ae70c6b9d9c?w=800",
        "https://images.pexels.com/photos/36772549/pexels-photo-36772549.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      categoryId: banarasiCat!.id,
      stock: 10,
      isFeatured: true,
      material: "Banarasi Silk",
      sizes: ["6.3 yards"],
      colors: ["Maroon", "Gold", "Navy"],
    },
    {
      name: "Banarasi Georgette Saree",
      slug: "banarasi-georgette-saree",
      description: "Modern Banarasi georgette saree with lightweight feel and elegant zari work.",
      price: 7999,
      compareAt: 9999,
      images: [
        "https://images.pexels.com/photos/37294263/pexels-photo-37294263.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/36134867/pexels-photo-36134867.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      categoryId: banarasiCat!.id,
      stock: 25,
      isFeatured: false,
      material: "Georgette",
      sizes: ["6.3 yards", "5.5 yards"],
      colors: ["Purple", "Teal", "Black"],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
