const db = require("../config/database");

exports.getJobs = async (req, res) => {
    try {
        const pool = await db;
        const { career } = req.query;

    if (!career) {
      return res.status(400).json({ error: "Missing course input" });
    }

    // Split multiple courses
    const courses = career
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (courses.length === 0) return res.json([]);

    // Build dynamic placeholders for course titles
    const placeholders = courses.map(() => "c.course_title LIKE ?");
    const params = courses.map((c) => `%${c}%`);

    const query = `
    WITH skill_union AS (
        SELECT DISTINCT s2.skill_name
        FROM Courses c
        JOIN Skills s2 ON c.course_id = s2.course_id
        WHERE ${placeholders.join(" OR ")}
    )
    SELECT 
        j.job_id,
        j.job_title,
        j.qualification,
        j.salary_min,
        j.salary_max,
        j.company_id,
        COUNT(DISTINCT s.skill_name) AS matched_skills
    FROM Jobs j
    JOIN Skills s ON j.job_id = s.job_id
    JOIN skill_union u ON u.skill_name = s.skill_name
    GROUP BY j.job_id
    ORDER BY matched_skills DESC
    LIMIT 20;
`;

    const [jobs] = await pool.query(query, params);

    res.json(jobs);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Database Error");
  }
};


exports.updateCourseAndRecommendJobs = async (req, res) => {
    try {
        const { user_id, course_id } = req.body;
        if (user_id == null|| course_id == null) return res.status(400).json({ message: "user_id and course_id are required" });

        const pool = await db;

        const [results] = await pool.query(
            "CALL sp_UpdateCourseStatusAndRecommendJobs(?, ?)",
            [user_id, course_id]
        );

        const recordsets = Array.isArray(results) ? results.filter(Array.isArray) : [];

        let skillAlignment = [];
        let topJobs = [];

        for (const set of recordsets) {
            if (!set.length || typeof set[0] !== "object") continue;
            if ("skill_status" in set[0]) {
                skillAlignment = set;
            } else if ("matching_skills" in set[0] || ("job_id" in set[0] && "company_name" in set[0])) {
                topJobs = set;
            }
        }

        res.json({ skillAlignment, topJobs });
    } catch (err) {
        console.error("DB ERROR:", err);
        res.status(500).send("Database Error");
    }
};
