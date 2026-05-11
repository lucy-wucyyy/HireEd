const db = require("../config/database");

// Fetch saved/applied jobs for a user
exports.getSavedJobs = async (req, res) => {
  try {
    const pool = await db;
    const { userId } = req.params;

    const [rows] = await pool.query(
      "SELECT uj.job_id, j.job_title, c.company_name, j.salary_min, j.salary_max, j.qualification, uj.status, uj.date_added " +
        "FROM UsersJobs uj " +
        "JOIN Jobs j ON uj.job_id = j.job_id " +
        "LEFT JOIN Companies c ON j.company_id = c.company_id " +
        "WHERE uj.user_id = ? " +
        "ORDER BY uj.date_added DESC",
      [userId]
    );

    res.json({ savedJobs: rows });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Database Error");
  }
};

// save a job for a user (defaults to saved status)
exports.saveJob = async (req, res) => {
  try {
    const pool = await db;
    const { userId, jobId, status } = req.body;

    if (!userId || !jobId) {
      return res.status(400).json({ message: "userId and jobId are required" });
    }

    const jobStatus = status === "applied" ? "applied" : "saved";

    // If already applied, do not downgrade to saved.
    const [existing] = await pool.query(
      "SELECT status FROM UsersJobs WHERE user_id = ? AND job_id = ? LIMIT 1",
      [userId, jobId]
    );
    if (existing.length && existing[0].status === "applied" && jobStatus !== "applied") {
      return res.json({ message: "Job already marked as applied" });
    }

    const query = `
      INSERT INTO UsersJobs (user_id, job_id, status, date_added)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        status = CASE
          WHEN UsersJobs.status = 'applied' THEN 'applied'
          ELSE VALUES(status)
        END,
        date_added = CASE
          WHEN UsersJobs.status = 'applied' THEN UsersJobs.date_added
          ELSE NOW()
        END
    `;

    await pool.query(query, [userId, jobId, jobStatus]);

    res.json({ message: jobStatus === "applied" ? "Job marked as applied" : "Job saved" });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Database Error");
  }
};

// Remove a saved job
exports.removeJob = async (req, res) => {
  try {
    const pool = await db;
    const { userId, jobId } = req.body;

    if (!userId || !jobId) {
      return res.status(400).json({ message: "userId and jobId are required" });
    }

    await pool.query("DELETE FROM UsersJobs WHERE user_id = ? AND job_id = ?", [
      userId,
      jobId,
    ]);

    res.json({ message: "Job removed" });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Database Error");
  }
};
