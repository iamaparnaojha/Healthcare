const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Mock database (replace this with MongoDB or another database in real apps)
const users = [];

const SECRET_KEY = "your_secret_key_here";

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Register route
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = users.find(user => user.email === email);

    if (userExists) {
        return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully!" });
});

// Login route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true }).json({ message: "Login successful!" });
});

// Profile route
app.get('/api/profile', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized!" });
    }

    try {
        const user = jwt.verify(token, SECRET_KEY);
        res.json({ user });
    } catch {
        res.status(401).json({ message: "Invalid token!" });
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    res.clearCookie('token').json({ message: "Logged out successfully!" });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
