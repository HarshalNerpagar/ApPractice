const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');

const prisma = new PrismaClient();
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

/** CRUD Operations **/

// CREATE a new user
app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = await prisma.user.create({
            data: { name, email },
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// READ all users
app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

// READ a single user by ID
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
        });
        if (user) res.json(user);
        else res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// UPDATE a user by ID
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { name, email },
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: "User not found or update failed" });
    }
});

// DELETE a user by ID
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: "User not found or delete failed" });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
