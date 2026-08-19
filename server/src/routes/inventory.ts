import express from "express";
import { query } from "../db";
import { asyncHandler } from "../http";

const router = express.Router();

// GET /api/inventory/items
router.get(
  "/items",
  asyncHandler(async (_req, res) => {
    const q = await query("SELECT id, product_code, title, spec, unit, system_qty FROM inventory_items ORDER BY product_code LIMIT 100");
    res.json({ items: q.rows });
  })
);

export default router;
