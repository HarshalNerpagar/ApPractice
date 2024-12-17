const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

// Load environment variables
dotenv.config();

// Initialize Express and Prisma
const app = express();
const prisma = new PrismaClient();

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const SALT_ROUNDS = 10;

// Middleware to parse JSON request bodies
app.use(express.json());

// ===== Signup Route =====
app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!password) return res.status(400).json({ error: "Password is required" });

    try {
        // Check if email is already registered
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create the user
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        // Respond with success
        res.status(201).json({
            message: "User created successfully",
            userId: user.id,
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ===== Login Route =====
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Find the user in the database
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // If user does not exist
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

        // Send back user data and token
        res.status(200).json({
            userdata: { id: user.id, name: user.name, email: user.email },
            accesstoken: token,
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// ===== Start the Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server is running at http://localhost:${PORT}`);
});

module.exports = app;
