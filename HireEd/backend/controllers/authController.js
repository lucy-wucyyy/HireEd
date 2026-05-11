const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const cookieOpts = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const makeToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

exports.signup = async (req, res) => {
    try {
        const { user_name, email, password, major = null, degree = null } = req.body;
        if (!user_name || !email || !password) return res.status(400).json({ message: "Missing fields" });

        const pool = await db;
        const [existing] = await pool.query("SELECT user_id FROM Users WHERE email = ?", [email]);
        if (existing.length) return res.status(409).json({ message: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
        "INSERT INTO Users (user_name, email, major, degree, password) VALUES (?, ?, ?, ?, ?)",
        [user_name, email, major, degree, hashed]
        );

        const token = makeToken({ user_id: result.insertId, email });
        res
        .cookie("token", token, cookieOpts)
        .status(201)
        .json({ user_id: result.insertId, email, user_name, major, degree });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Missing fields" });

        const pool = await db;
        const [rows] = await pool.query("SELECT * FROM Users WHERE email = ? LIMIT 1", [email]);
        const user = rows[0];
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        let ok = false;
        if (user.password) {
            ok = await bcrypt.compare(password, user.password);
        }
        // Fallback for legacy plaintext passwords
        if (!ok && password === user.password) {
            ok = true;
            // Re-hash and update to secure future logins
            const newHash = await bcrypt.hash(password, 10);
            await pool.query("UPDATE Users SET password = ? WHERE user_id = ?", [newHash, user.user_id]);
        }
        if (!ok) return res.status(401).json({ message: "Invalid credentials" });

        const token = makeToken({ user_id: user.user_id, email: user.email });
        res
        .cookie("token", token, cookieOpts)
        .json({
            user_id: user.user_id,
            email: user.email,
            user_name: user.user_name,
            major: user.major,
            degree: user.degree,
            bio: user.bio || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};

exports.me = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: "Not authenticated" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const pool = await db;
        const [rows] = await pool.query("SELECT * FROM Users WHERE user_id = ? LIMIT 1", [decoded.user_id]);
        const user = rows[0];
        if (!user) return res.status(401).json({ message: "Not authenticated" });

        res.json({
        user_id: user.user_id,
        email: user.email,
        user_name: user.user_name,
        major: user.major,
        degree: user.degree,
        bio: user.bio || null,
        });
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Not authenticated" });
    }
};

exports.signout = async (_req, res) => {
    res.clearCookie("token", cookieOpts).json({ message: "Signed out" });
};
