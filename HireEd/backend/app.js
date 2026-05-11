require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Routes
const indexRouter = require("./routes/index");
const userRouter = require("./routes/users");
const jobRouter = require("./routes/jobs");
const courseRouter = require("./routes/courses");
const cookieParser = require("cookie-parser");
const userCoursesRouter = require("./routes/userCourses");
const userJobsRouter = require("./routes/userJobs");

// Dynamic CORS setup
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests

    // Allow localhost and any local network IP (10.x.x.x)
    const allowed = /^(https?:\/\/(localhost|127\.0\.0\.1)|https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d{1,5}$/;
    if (allowed.test(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS blocked for origin ${origin}`), false);
    }
  },
  credentials: true, // allow cookies/auth headers
};

app.use(cors(corsOptions));
app.use(cookieParser());



const authRouter = require("./routes/auth");

// built-in middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", indexRouter)
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/jobs", jobRouter);
app.use("/courses", courseRouter);
app.use("/user-courses", userCoursesRouter);
app.use("/user-jobs", userJobsRouter);

module.exports = app;
