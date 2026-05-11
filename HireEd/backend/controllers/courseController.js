// const db = require("../config/database");
// exports.getCourses = async (req, res) => {
//     try {
//         const pool = await db;
//         const { course } = req.query;
//         let query = "SELECT * FROM Courses";
//         const params = [];

//         if (course) {
//             query += " WHERE course_title LIKE ? ";
//             params.push(`%${course}%`);
//         }

//         query += " LIMIT 10";

//         const [rows] = await pool.query(query, params);
//         res.json(rows);
//     } catch (err) {
//         console.error("DB ERROR:", err);
//         res.status(500).send("Database Error");
//     }
// };

const db = require("../config/database");
exports.getCourses = async (req, res) => {
  try {
    const pool = await db;
    const { career } = req.query;

    if (!career) {
      return res.status(400).json({ error: "Missing career query" });
    }

    const query = `
            SELECT c.course_id,
                   c.course_title,
                   COUNT(s.skill_name) AS matched_skills
            FROM Courses c
            JOIN Skills s ON c.course_id = s.course_id
            WHERE s.skill_name IN (
                SELECT skill_name
                FROM Skills
                WHERE job_id = (
                    SELECT job_id
                    FROM Jobs
                    WHERE job_title LIKE ?
                )
            )
            GROUP BY c.course_id, c.course_title
            ORDER BY matched_skills DESC
            LIMIT 15;
        `;

    const params = [`%${career}%`];

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Database Error");
  }
};

exports.recommendCoursesAndMissingSkills = async (req, res) => {
  try {
    const { job_title, user_id } = req.query;
    if (!job_title)
      return res.status(400).json({ message: "job title is required" });

    const pool = await db;
    const uid = user_id ? Number(user_id) : 0; // default to 0 if unauthenticated

    // returns two result sets
    const [results] = await pool.query(
      "CALL sp_RecommendCoursesAndMissingSkills(?, ?)",
      [job_title, uid]
    );

    const courseIds = (results?.[1] || []).map((c) => c.course_id);

    let courseDetails = [];
    if (courseIds.length > 0) {
      const [detailRows] = await pool.query(
        "SELECT course_id, course_title, subject, rating, level FROM Courses WHERE course_id IN (?)",
        [courseIds]
      );
      courseDetails = detailRows || [];
    }

    const detailsMap = new Map(courseDetails.map((c) => [c.course_id, c]));

    const courses = courseIds.map((id) => {
      const detail = detailsMap.get(id) || {};
      return {
        course_id: id,
        course_title: detail.course_title || rec.course_title || "",
        subject: detail.subject || rec.subject || null,
        rating: detail.rating ?? null,
        level: detail.level ?? null,
      };
    });

    res.json({ courses });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Database Error");
  }
};
