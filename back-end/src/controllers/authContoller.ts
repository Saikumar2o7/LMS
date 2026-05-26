import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const authController = {
  // User registration
  async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User already exists with this email" });
      }

      // Validate role (only borrower can self-register, other roles are admin-created)
      if (role && role !== "borrower") {
        return res
          .status(403)
          .json({ error: "Only borrower accounts can be self-registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        role: role || "borrower",
      });

      await user.save();

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" },
      );

      // Return user info (excluding password)
      const userResponse = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      res.status(201).json({
        message: "Registration successful",
        token,
        user: userResponse,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  },

  // User login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" },
      );

      // Return user info (excluding password)
      const userResponse = {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      };

      res.json({
        message: "Login successful",
        token,
        user: userResponse,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  },

  // Get current user (for session validation)
  async getCurrentUser(req: any, res: Response) {
    try {
      const user = await User.findById(req.user._id).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  },

  // Change password
  async changePassword(req: any, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to change password" });
    }
  },

  // Admin: Create user with specific role
  async createUserByAdmin(req: any, res: Response) {
    try {
      const { email, password, role, fullName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User already exists with this email" });
      }

      // Validate role
      const validRoles = [
        "borrower",
        "sales",
        "sanction",
        "disbursement",
        "collection",
        "admin",
      ];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        role,
        fullName,
      });

      await user.save();

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      console.error("Admin user creation error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  },

  // Admin: Get all users
  async getAllUsers(req: any, res: Response) {
    try {
      const users = await User.find({}).select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },
};
