import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { query } from "../db";
import { config } from "../config";
import { sendError } from "../services/http";

const signupSchema = z.object({
  firstName: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  studentNumber: z.string().regex(/^\d{8}$/).optional(),
  blockId: z.number().int().positive().optional(),
  roomId: z.number().int().positive().optional(),
  roleName: z.enum(["student", "admin"]).default("student"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const STUDENT_EMAIL_DOMAIN = "mynwu.ac.za";

function generateAdminUserNumber() {
  const nextValue = (Date.now() + Math.floor(Math.random() * 100000)) % 100000000;
  return String(nextValue).padStart(8, "0");
}

export const authRouter = Router();

authRouter.get("/signup/blocks", async (_req, res) => {
  const result = await query<{ block_id: number; block_name: string }>(
    `SELECT block_id, block_name
     FROM public.block
     WHERE block_type = 'Residential'
     ORDER BY block_num`,
  );

  return res.json(result.rows);
});

authRouter.get("/signup/blocks/:blockId/available-rooms", async (req, res) => {
  const blockId = Number(req.params.blockId);
  if (!Number.isInteger(blockId) || blockId <= 0) {
    return sendError(res, 400, "Invalid block id");
  }

  const result = await query<{ room_id: number; room_number: number }>(
    `SELECT r.room_id, r.room_number
     FROM public.room r
     JOIN public.block b ON b.block_id = r.block_id
     WHERE r.block_id = $1
       AND b.block_type = 'Residential'
       AND NOT EXISTS (
         SELECT 1
         FROM public.users u
         WHERE u.block_id = r.block_id
           AND u.room_id = r.room_id
       )
     ORDER BY r.room_number`,
    [blockId],
  );

  return res.json(result.rows);
});

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const { firstName, surname, email, password, studentNumber, blockId, roomId, roleName } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  if (roleName === "student") {
    if (!studentNumber) {
      return sendError(res, 400, "Student number is required for student accounts");
    }

    if (!blockId || !roomId) {
      return sendError(res, 400, "Student users must have both block_id and room_id");
    }

    const expectedEmail = `${studentNumber}@${STUDENT_EMAIL_DOMAIN}`;
    if (normalizedEmail !== expectedEmail) {
      return sendError(res, 400, `Student email must be ${expectedEmail}`);
    }

    const availableRoomResult = await query<{ room_id: number }>(
      `SELECT r.room_id
       FROM public.room r
       JOIN public.block b ON b.block_id = r.block_id
       WHERE r.room_id = $1
         AND r.block_id = $2
         AND b.block_type = 'Residential'
         AND NOT EXISTS (
           SELECT 1
           FROM public.users u
           WHERE u.block_id = r.block_id
             AND u.room_id = r.room_id
         )
       LIMIT 1`,
      [roomId, blockId],
    );

    if (availableRoomResult.rowCount === 0) {
      return sendError(res, 400, "Selected room is not available for this block");
    }
  }

  const roleResult = await query<{ role_id: number }>(
    "SELECT role_id FROM public.role WHERE lower(role_name) = lower($1) LIMIT 1",
    [roleName],
  );

  if (roleResult.rowCount === 0) {
    return sendError(res, 400, `Role '${roleName}' not found in role table`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userNumber = studentNumber ?? (roleName === "admin" ? generateAdminUserNumber() : null);

  try {
    const insertResult = await query<{
      user_id: string;
      email: string;
      first_name: string;
      surname: string;
      student_number: string | null;
      role_name: string;
    }>(
      `INSERT INTO public.users
      (first_name, surname, email, password_hash, user_number, block_id, room_id, role_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id, email, first_name, surname, user_number AS student_number,
      (SELECT role_name FROM public.role WHERE role_id = users.role_id) AS role_name`,
      [
        firstName,
        surname,
        normalizedEmail,
        passwordHash,
        userNumber,
        blockId ?? null,
        roomId ?? null,
        roleResult.rows[0].role_id,
      ],
    );

    const user = insertResult.rows[0];

    const signOptions: SignOptions = {
      expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
    };

    const token = jwt.sign(
      { userId: user.user_id, role: user.role_name.toLowerCase(), email: user.email },
      config.jwtSecret,
      signOptions,
    );

    return res.status(201).json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        surname: user.surname,
        studentNumber: user.student_number,
        role: user.role_name.toLowerCase(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Signup failed";
    if (message.includes("users_email_key")) {
      return sendError(res, 409, "Email already exists");
    }
    if (message.includes("users_user_number_key")) {
      return sendError(res, 409, "Student number already exists");
    }
    if (message.includes("Student users must have both block_id and room_id")) {
      return sendError(res, 400, "Student users must have both block_id and room_id");
    }
    return sendError(res, 500, message);
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const { email, password } = parsed.data;

  const userResult = await query<{
    user_id: string;
    email: string;
    first_name: string;
    surname: string;
    student_number: string | null;
    password_hash: string;
    role_name: string;
  }>(
    `SELECT u.user_id, u.email, u.first_name, u.surname, u.user_number AS student_number, u.password_hash, r.role_name
    FROM public.users u
    JOIN public.role r ON r.role_id = u.role_id
    WHERE lower(u.email) = lower($1)
    LIMIT 1`,
    [email],
  );

  if (userResult.rowCount === 0) {
    return sendError(res, 401, "Invalid credentials");
  }

  const user = userResult.rows[0];
  const passwordOk = await bcrypt.compare(password, user.password_hash);

  if (!passwordOk) {
    return sendError(res, 401, "Invalid credentials");
  }

  const signOptions: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    { userId: user.user_id, role: user.role_name.toLowerCase(), email: user.email },
    config.jwtSecret,
    signOptions,
  );

  return res.json({
    token,
    user: {
      id: user.user_id,
      email: user.email,
      firstName: user.first_name,
      surname: user.surname,
      studentNumber: user.student_number,
      role: user.role_name.toLowerCase(),
    },
  });
});
