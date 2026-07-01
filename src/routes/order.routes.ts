import { Router } from "express";
import { createOrder, getOrders, getOrder, updateOrderStatus } from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", authorize("ADMIN"), updateOrderStatus);

export default router;
