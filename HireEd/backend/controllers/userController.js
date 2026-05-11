const db = require("../config/database");

exports.getUser = async (req, res) => {
    try {
        const { email, password } = req.query;
        const pool = await db;

        if (!email) {
            const [rows] = await pool.query("SELECT * FROM Users LIMIT 100");
            return res.json(rows);
        }

        const sql = `
            SELECT * FROM Users
            WHERE email = ?
            ${password ? "AND password = ?" : ""}
            LIMIT 1
        `;
        const params = password ? [email, password] : [email];
        const [rows] = await pool.query(sql, params);
        return res.json(rows);
    } catch (err) {
        console.error("DB ERROR:", err);
        res.status(500).send("Database Error");
    }
};

exports.createUser = async (req, res) => {
    try {
        const { user_name, email, major, degree, password } = req.body;

        // Basic validation (optional but recommended)
        if (!user_name || !email) {
            return res.status(400).json({ message: "user_name and email are required" });
        }

        const pool = await db;

        const sql = `
            INSERT INTO Users (user_name, email, major, degree, password)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            user_name,
            email,
            major ?? null,
            degree ?? null,
            password ?? null
        ]);

        res.status(201).json({
            message: "User created successfully",
            user_id: result.insertId
        });

    } catch (err) {
        console.error("DB ERROR:", err);
        res.status(500).send("Database Error");
    }
};

// delete by id
exports.deleteUser = async (req, res) => {
    try {
        const { email, user_id } = req.body;
        if (!email && !user_id) return res.status(400).json({ message: "email or user_id required" });

        const pool = await db;
        let id = user_id;
        if (!id) {
            const [rows] = await pool.query("SELECT user_id FROM Users WHERE email = ? LIMIT 1", [email]);
            if (!rows.length) return res.status(404).json({ message: "User not found" });
            id = rows[0].user_id;
        }
        
        await pool.query("DELETE FROM UsersCourses WHERE user_id = ?", [id]);
        await pool.query("DELETE FROM UsersJobs WHERE user_id = ?", [id]);
        
        const [result] = await pool.query("DELETE FROM Users WHERE user_id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted" });
    } catch (err) {
        console.error("DB ERROR:", err);
        res.status(500).send("Database Error");
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { email, user_id, user_name, major, degree, password } = req.body;
        if (!email && !user_id) return res.status(400).json({ message: "email or user_id required" });

        const pool = await db;
        const sql = `
            UPDATE Users
            SET
                user_name = COALESCE(?, user_name),
                major     = COALESCE(?, major),
                degree    = COALESCE(?, degree),
                password  = COALESCE(?, password)
            WHERE ${user_id ? "user_id = ?" : "email = ?"}
        `;
        const params = user_id
            ? [user_name ?? null, major ?? null, degree ?? null, password ?? null, user_id]
            : [user_name ?? null, major ?? null, degree ?? null, password ?? null, email];

        const [result] = await pool.query(sql, params);
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User updated" });
    } catch (err) {
        console.error("DB ERROR:", err);
        res.status(500).send("Database Error");
    }
};
