import express from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";
const router = express.Router();

router.use(requireAuth);

// GET /api/inventory/items
router.get("/items", async (req, res) => {
  try {
    const q = await query(
      "SELECT id, product_code, title, spec, unit, system_qty FROM inventory_items ORDER BY product_code LIMIT 100"
    );
    res.json({ items: q.rows });
  } catch (err) {
    console.error("inventory error:", err);
    res.status(500).json({ error: "internal server error" });
  }
});

export default router;
