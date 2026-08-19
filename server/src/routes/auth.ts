import express from "express";
import { query } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config";
const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { personnel_code, password } = req.body ?? {};
    if (
      typeof personnel_code !== "string" ||
      typeof password !== "string" ||
      personnel_code.length === 0 ||
      personnel_code.length > 64 ||
      password.length === 0 ||
      password.length > 128
    ) {
      return res.status(400).json({ error: "missing or invalid fields" });
    }

    const q = await query(
      "SELECT id, personnel_code, password_hash, full_name, role FROM users WHERE personnel_code = $1 AND is_active = TRUE",
      [personnel_code]
    );
    const user = q.rows[0];
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, personnel_code: user.personnel_code, role: user.role },
      getJwtSecret(),
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user.id, personnel_code: user.personnel_code, full_name: user.full_name, role: user.role },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "internal server error" });
  }
});

export default router;
