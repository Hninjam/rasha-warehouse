import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db";
import { config } from "../config";
import { asyncHandler, badRequest, unauthorized } from "../http";

const router = express.Router();

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { personnel_code, password } = req.body;
    if (!personnel_code || !password) return badRequest(res);

    const q = await query("SELECT id, personnel_code, password_hash, full_name, role FROM users WHERE personnel_code = $1", [personnel_code]);
    const user = q.rows[0];
    if (!user) return unauthorized(res);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return unauthorized(res);

    const token = jwt.sign({ userId: user.id, personnel_code: user.personnel_code, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);

    res.json({ token, user: { id: user.id, personnel_code: user.personnel_code, full_name: user.full_name, role: user.role } });
  })
);

export default router;
