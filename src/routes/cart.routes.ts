import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/:id", removeCartItem);

export default router;
