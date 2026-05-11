const db = require("../config/database");

// Get all saved courses for a user
exports.getSavedCourses = async (req, res) => {
  try {
    const pool = await db;
    const { userId } = req.params;

    const [rows] = await pool.query(
      "SELECT uc.course_id, c.course_title, c.subject, c.rating, c.level, uc.status, uc.date_added " +
      "FROM UsersCourses uc " +
      "JOIN Courses c ON uc.course_id = c.course_id " +
      "WHERE uc.user_id = ?" +
      "ORDER BY uc.date_added DESC",
      [userId]
    );

    res.json({ savedCourses: rows });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Database Error");
  }
};

// Save a course for a user
exports.saveCourse = async (req, res) => {
  try {
    const pool = await db;
    const { userId, courseId } = req.body;

    // Insert or update if exists
    const query = `
      INSERT INTO UsersCourses (user_id, course_id, status, date_added)
      VALUES (?, ?, 'saved', NOW())
      ON DUPLICATE KEY UPDATE status = 'saved', date_added = NOW()
    `;
    await pool.query(query, [userId, courseId]);

    res.json({ message: "Course saved" });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Database Error");
  }
};

// Remove a saved course for a user
exports.removeCourse = async (req, res) => {
  try {
    const pool = await db;
    const { userId, courseId } = req.body;

    await pool.query(
      "DELETE FROM UsersCourses WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    res.json({ message: "Course removed" });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Database Error");
  }
};

// // Mark a course as completed
// exports.completeCourse = async (req, res) => {
//   try {
//     const pool = await db;
//     const { userId, courseId } = req.body;
//     const [result] = await pool.query(
//       "UPDATE UsersCourses SET status = 'completed', date_added = NOW() WHERE user_id = ? AND course_id = ?",
//       [userId, courseId]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     res.json({ message: "Course marked as completed" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Database error");
//   }
// };