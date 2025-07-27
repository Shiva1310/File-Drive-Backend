import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ msg: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed });
  await user.save();
  res.status(201).json({ msg: "User registered" });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password||"");
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn:"50m"});
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
};

export const refreshToken = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_REFRESH_SECRET!, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    res.json({ accessToken });
  });
};
