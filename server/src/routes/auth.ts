import express from "express";
import { query } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { personnel_code, password } = req.body;
  if (!personnel_code || !password) return res.status(400).json({ error: "missing fields" });

  const q = await query("SELECT id, personnel_code, password_hash, full_name, role FROM users WHERE personnel_code = $1", [personnel_code]);
  const user = q.rows[0];
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: "invalid credentials" });

  const token = jwt.sign({ userId: user.id, personnel_code: user.personnel_code, role: user.role }, process.env.JWT_SECRET || "change_me", { expiresIn: "8h" });

  res.json({ token, user: { id: user.id, personnel_code: user.personnel_code, full_name: user.full_name, role: user.role } });
});

export default router;
