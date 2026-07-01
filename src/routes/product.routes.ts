import { Router } from "express";
import { listProducts, getProduct, getFeaturedProducts, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", listProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:slug", getProduct);
router.post("/", authenticate, authorize("ADMIN"), createProduct);
router.put("/:id", authenticate, authorize("ADMIN"), updateProduct);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteProduct);

export default router;
