# Implementation Details

## Application Requirements

### CRUD Operations

Using the CRUD operations on the ```UsersCourses``` table as example, implemented in [HireEd/backend/controllers/userCoursesController.js](https://www.example.com](https://github.com/cs411-alawini/fa25-cs411-team121-121/blob/main/HireEd/backend/controllers/userCoursesController.js)):

* Create

```sql
INSERT INTO UsersCourses (user_id, course_id, status, date_added)
VALUES (?, ?, 'saved', NOW())
ON DUPLICATE KEY UPDATE status = 'saved', date_added = NOW();
```
  
* Read: 

```sql
SELECT uc.course_id, c.course_title, c.subject, c.rating, c.level, uc.status, uc.date_added
FROM UsersCourses uc
JOIN Courses c ON uc.course_id = c.course_id
WHERE uc.user_id = ? AND uc.status = 'saved';
```

* Update: 

```sql
UPDATE UsersCourses
SET status = 'completed', date_added = NOW()
WHERE user_id = ? AND course_id = ?;
```

* Delete

```sql
DELETE FROM UsersCourses
WHERE user_id = ? AND course_id = ? AND status = 'saved';
```

### Search Functionality

**Interface**

<img width="1510" height="1334" alt="image" src="https://github.com/user-attachments/assets/931e220d-9d91-4e95-94a1-24c2ec98abd4" />

<img width="2880" height="1720" alt="image" src="https://github.com/user-attachments/assets/88ab4fff-e922-48e4-9b57-9f139a89a78b" />

**Code**

[Career to Course Search](https://github.com/cs411-alawini/fa25-cs411-team121-121/blob/main/HireEd/backend/controllers/courseController.js)

[Course to Career Search](https://github.com/cs411-alawini/fa25-cs411-team121-121/blob/main/HireEd/backend/controllers/jobController.js)

**Query Execution**

<img width="2258" height="618" alt="image" src="https://github.com/user-attachments/assets/ae79dd67-9fed-4d3d-b502-325b8647b5ad" />

(Refer to the Procedure section below for the specific query inside the procedure.)

<img width="2236" height="1174" alt="image" src="https://github.com/user-attachments/assets/b6655473-18f1-4b4e-83aa-dadd0446bda1" />

## Advanced Database Features

### Transactions

The ```sp_UpdateCourseStatusAndRecommendJobs``` procedure is a **transactional** operation that updates the status of a user’s course(s) between 'saved' and 'completed', and simultaneously generates personalized job recommendations based on the skills the user has acquired from their completed courses. The procedure is designed to be called directly from an application, providing an atomic, consistent, and functional interface for course management and career guidance. 

**Advanced Query 1 - Top Job Recommendations:** Generate the top recommended jobs for the user based on the skills acquired from all completed courses.

1. **Joins across multiple relations:** Combines UsersCourses, Courses, Skills, Jobs, and Companies to compute job relevance.

2. **Aggregation via GROUP BY:** Counts the number of matching skills per job to rank jobs by skill fit.

**Advanced Query 2 – Skill Alignment Analysis:** Identify for each top recommended job which required skills the user has already acquired (aligned) and which are still missing (missing).

1. **Subqueries / temporary tables:** Collects the user’s acquired skills and the required skills for the top jobs.

2. **Alignment check via LEFT JOIN:** Compares the top job skills to the user’s skill set to classify each skill as ‘aligned’ or ‘missing’.

``` sql
CREATE PROCEDURE sp_UpdateCourseStatusAndRecommendJobs(
    IN p_user_id INT,
    IN p_course_id INT
)
BEGIN
    DECLARE current_status ENUM('saved','completed');

    START TRANSACTION;

    -- Step 0: Get current status of the course
    SELECT status INTO current_status
    FROM UsersCourses
    WHERE user_id = p_user_id
      AND course_id = p_course_id
    LIMIT 1;

    -- Step 1: Toggle the status
    IF current_status = 'saved' THEN
        UPDATE UsersCourses
        SET status = 'completed'
        WHERE user_id = p_user_id
          AND course_id = p_course_id;
    ELSEIF current_status = 'completed' THEN
        UPDATE UsersCourses
        SET status = 'saved'
        WHERE user_id = p_user_id
          AND course_id = p_course_id;
    END IF;

    -- Step 2: Generate top 15 recommended jobs based on completed courses
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_top_jobs (
        job_id INT PRIMARY KEY,
        job_title VARCHAR(255),
        company_name VARCHAR(255),
        matching_skills INT
    );
    TRUNCATE TABLE temp_top_jobs;

    INSERT INTO temp_top_jobs (job_id, job_title, company_name, matching_skills)
    SELECT j.job_id,
           j.job_title,
           comp.company_name,
           COUNT(DISTINCT s.skill_name) AS matching_skills
    FROM UsersCourses uc
    JOIN Courses c ON uc.course_id = c.course_id
    JOIN Skills s ON s.course_id = c.course_id
    JOIN Jobs j ON j.job_id = s.job_id
    JOIN Companies comp ON comp.company_id = j.company_id
    WHERE uc.user_id = p_user_id
      AND uc.status = 'completed'
    GROUP BY j.job_id, j.job_title, comp.company_name
    ORDER BY matching_skills DESC
    LIMIT 15;

    -- Step 3: Collect user's completed skills
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_user_skills (
        skill_name VARCHAR(255) PRIMARY KEY
    );
    TRUNCATE TABLE temp_user_skills;

    INSERT INTO temp_user_skills (skill_name)
    SELECT DISTINCT s.skill_name
    FROM UsersCourses uc
    JOIN Skills s ON s.course_id = uc.course_id
    WHERE uc.user_id = p_user_id
      AND uc.status = 'completed';

    -- Step 4: Compute aligned/missing skills for top jobs without duplicates
    SELECT 
        t.job_id,
        t.job_title,
        t.company_name,
        s.skill_name,
        CASE 
            WHEN us.skill_name IS NOT NULL THEN 'aligned'
            ELSE 'missing'
        END AS skill_status
    FROM temp_top_jobs t
    JOIN (
        SELECT DISTINCT job_id, skill_name
        FROM Skills
    ) s ON t.job_id = s.job_id
    LEFT JOIN temp_user_skills us ON us.skill_name = s.skill_name
    ORDER BY t.job_id, skill_status, s.skill_name;

    -- Step 5: Return top jobs separately
    SELECT * FROM temp_top_jobs;

    COMMIT;

END;
```

### Procedures

The ```sp_RecommendCoursesAndMissingSkills``` stored procedure generates personalized course recommendations and identifies missing skills for a user based on the skills they have already acquired from completed courses. It is designed to be called directly from an application, providing an atomic and consistent view of course recommendations and skill gaps without modifying any data.

**Advanced Query 1 – Top Course Recommendations:** Generate the top 15 courses most aligned with a target job title, based on skills required for that job.

1. **Joins across multiple relations:** Combines Courses, Skills, and Jobs to identify which courses provide skills relevant to the target job.

2. **Aggregation via GROUP BY:** Counts the number of matched skills per course to rank courses according to skill relevance.

**Advanced Query 2 – Missing Skill Identification:** For each recommended course, determine which skills the user has not yet acquired.

1. **Subqueries / temporary tables:** Collects the user’s completed skills to compare against skills taught in the recommended courses.

2. **Alignment check via LEFT JOIN:** Compares each course’s skills to the user’s skill set to classify skills as “missing” if the user hasn’t learned them yet.

```sql
CREATE PROCEDURE sp_RecommendCoursesAndMissingSkills(
    IN p_job_title VARCHAR(255),
    IN p_user_id INT
)
BEGIN
    -- Step 0: Temporary table for recommended courses
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_courses (
        course_id INT,
        course_title VARCHAR(255),
        subject VARCHAR(255),
        matched_skills INT,
        INDEX(course_id)
    );

    TRUNCATE TABLE temp_courses;

    -- Step 1: Insert top 15 recommended courses for the job title
    INSERT INTO temp_courses (course_id, course_title, subject, matched_skills)
    SELECT 
        c.course_id,
        c.course_title,
        c.subject,
        COUNT(DISTINCT s.skill_name) AS matched_skills
    FROM Courses c
    JOIN Skills s ON c.course_id = s.course_id
    JOIN Jobs j ON s.job_id = j.job_id
    WHERE j.job_title LIKE CONCAT('%', p_job_title, '%')
    GROUP BY c.course_id, c.course_title, c.subject
    ORDER BY matched_skills DESC
    LIMIT 15;

    -- Step 2: Temporary table for missing skills per course
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_skills (
        course_id INT,
        course_title VARCHAR(255),
        skill_name VARCHAR(255),
        INDEX(course_id),
        INDEX(skill_name)
    );

    TRUNCATE TABLE temp_skills;

    -- Step 2a: Insert missing skills (skills in recommended courses that user hasn't acquired)
    INSERT INTO temp_skills (course_id, course_title, skill_name)
    SELECT 
        tc.course_id,
        tc.course_title,
        s.skill_name
    FROM temp_courses tc
    JOIN Skills s ON tc.course_id = s.course_id
    LEFT JOIN (
        -- All skills the user has from completed courses
        SELECT DISTINCT s2.skill_name
        FROM UsersCourses uc2
        JOIN Skills s2 ON uc2.course_id = s2.course_id
        WHERE uc2.user_id = p_user_id
          AND uc2.status = 'completed'
    ) AS user_skills ON s.skill_name = user_skills.skill_name
    WHERE user_skills.skill_name IS NULL
    ORDER BY tc.course_id, s.skill_name;

    -- Step 3: Return results
    SELECT * FROM temp_courses;
    SELECT DISTINCT * FROM temp_skills;

END;
```

### Triggers

The triggers ensure that critical entities (```Companies``` or ```Institutions```) cannot be deleted while dependent records (jobs or courses) exist.

```sql
CREATE TRIGGER prevent_company_delete
BEFORE DELETE ON Companies
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 
               FROM Jobs 
               WHERE company_id = OLD.company_id) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Cannot delete company with active job postings.';
    END IF;
END;
```
```sql
CREATE TRIGGER prevent_institution_delete
BEFORE DELETE ON Institutions
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 
               FROM Courses 
               WHERE inst_id = OLD.inst_id) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Cannot delete institution with associated courses.';
    END IF;
END;
```

### Constraints

The ```Users``` table uses multiple types of constraints to ensure data integrity and enforce business rules:

1. **Primary Key (```user_id```)** – Ensures each user has a unique identifier.

2. **Unique Key (```email```)** – Guarantees no two users can register with the same email.

3. **Tuple-level Check (```check_password_format```)** – Enforces that each password has at least 6 characters, contains at least one uppercase letter, and at least one numeric digit.

4. **Attribute-level constraints** – ```NOT NULL``` on ```user_id``` and ```password``` ensures these essential fields are always provided.

```sql
CREATE TABLE `Users` (
    `user_id` INT NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(255) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `major` VARCHAR(255) DEFAULT NULL,
    `degree` VARCHAR(255) DEFAULT NULL,
    `password` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `unique_email` (`email`),
    CONSTRAINT `check_password_format` 
        CHECK (
            CHAR_LENGTH(`password`) >= 6 
            AND REGEXP_LIKE(`password`, _utf8mb4'[A-Z]') 
            AND REGEXP_LIKE(`password`, _utf8mb4'[0-9]')
        )
) 
```

## Project Report
**1. Please list out changes in the directions of your project if the final project is different from your original proposal (based on your stage 1 proposal submission).**
   
The overall direction of our project remained consistent with the Stage 1 proposal. We continue to provide bidirectional matching between courses and jobs based on skills. Additionally, users can save jobs and courses of interest and track their progress through status updates. Minor schema enhancements, such as adding status columns in the relationship tables and a password column in the ```Users``` table (hashed for security), were made to improve functionality and user experience.
  
**2. Discuss what you think your application achieved or failed to achieve regarding its usefulness.**

Our application successfully implements the core functionality of course-to-job and job-to-course skill-based matching. The advanced database programs—such as procedures for recommending courses, computing missing skills, and tracking user progress—work effectively to support this functionality. However, the search conditions are somewhat strict and inflexible, and the skills extracted from course and job descriptions are not fully comprehensive. As a result, the search results are more limited than expected. While the database programs perform as intended, the application could be improved with more sophisticated skill extraction and more flexible search strategies beyond simple ```LIKE``` queries.

**3. Discuss if you changed the schema or source of the data for your application.**

We modified the source of our job data from what was proposed. In the proposal, we planned to use the **O*NET® 30.0 Database**, but we found it was not sufficiently descriptive for our skill matching. We therefore switched to a [**Kaggle**](https://www.kaggle.com/datasets/ravindrasinghrana/job-description-dataset) dataset containing more detailed job postings, which allowed for richer skill extraction and better recommendations.

The Users table remained synthetic, generated using the Faker Python library, since no external dataset was available.

We also enhanced the schema with additional integrity constraints:

* a ```UNIQUE``` constraint on email

* a ```CHECK``` constraint enforcing password complexity

* a new ```password``` column (hashed before insertion)

These changes improved data validity and security without altering the core dataset sources.

**4. Discuss what you change to your ER diagram and/or your table implementations. What are some differences between the original design and the final design? Why? What do you think is a more suitable design?**

In our UML diagram, we did not show the ```UsersCourses``` or ```UsersJobs``` relationships because we initially treated them as simple many-to-many tables containing only two foreign keys as their composite primary key. 

However, during implementation we discovered the need to store user-specific information, such as:

* ```UsersCourses.status``` ('saved' / 'completed')

* ```UsersJobs.status``` ('saved' / 'applied')

Adding these attributes converted the relationships into full associative entities, which required updating the table implementations even though the UML diagram remained simplified.

We also added:

* a ```password``` column (hashed) in the Users table, which was not part of the UML diagram

* two referential integrity triggers preventing deletion of companies or institutions that still have dependent jobs or courses

These updates made the final design more suitable because they support personalization, enforce data integrity, and enable secure authentication—capabilities that were not captured in the initial abstract UML representation.

**5. Discuss what functionalities you added or removed. Why?**

We expanded the functionality of our application beyond simply allowing users to view courses and jobs. In the final design, we added interactive features that let users save items of interest and update their status over time. These enhancements leverage our existing relationship tables (UsersCourses and UsersJobs) and transform them from passive linkage tables into meaningful user-specific tracking tools.

We added these features because they create a more personalized, engaging, and realistic user experience. By allowing users to build a learning plan, track progress, and manage their job search activity, the application becomes far more useful than a simple catalog of listings.

No major functionalities were removed; rather, the system was expanded to better support real-world workflow and user-centered design.

**6. Explain how you think your advanced database programs complement your application.**

Our advanced database programs significantly enhance the intelligence, personalization, and reliability of the application. Rather than functioning as a simple data lookup system, the database actively participates in generating insights and enforcing business rules that directly improve user experience.

**Personalized, skill-driven recommendations**

Our stored procedures—such as ```sp_RecommendCoursesAndMissingSkills``` and ```sp_UpdateCourseStatusAndRecommendJobs—perform``` multi-table analyses that the application alone cannot efficiently compute.
They:

* Match users’ completed courses to job requirements through multi-relation joins.

* Compute recommended jobs ranked by skill alignment.

* Identify missing skills the user should acquire next.

* Recommend courses that fill those gaps.

Because these computations happen inside the database, the application simply receives high-quality, pre-processed recommendations, keeping the frontend fast and reducing backend complexity.

**Dynamic updates tied directly to user actions**

The transaction-based procedure that toggles course statuses ('saved' ↔ 'completed') ensures that each user action automatically triggers a recalculation of personalized job suggestions.
This creates a responsive, adaptive application where the results evolve as the user progresses through courses.

**7. Each team member should describe one technical challenge that the team encountered.  This should be sufficiently detailed such that another future team could use this as helpful advice if they were to start a similar project or where to maintain your project.**

Eunice - One technical challenge in the project was constructing the Skills table, which required transforming two datasets into a unified job-course skill mapping. The raw jobs dataset contained over 1.6 million rows, so I first had to reduce it by keeping only the top 5,000 listings per job title based on salary, then reindexing the cleaned table. I generated “skills” by tokenizing both course titles and job titles, removing stopwords and punctuation, and normalizing everything to lowercase. Because the datasets shared no common schema, I used phonetic matching (SOUNDEX) to connect course keywords with job keywords, which required batching queries to avoid timeouts. After generating millions of raw matches, they were aggregated into pairs by grouping on (job_id, course_id) and keeping only those with multiple distinct keyword overlaps. This process required extensive indexing and iterative cleaning to prevent performance problems and false positives. 

Josephine - One major challenge I encountered was applying the UML diagram and relational schema concepts we learned in class to our actual project. During the project, we realized that solving isolated classroom problems was very different from designing a complete system from scratch. Although we were able to draw our UML diagram smoothly, we quickly became unsure about how to properly describe the relationships between entities. This confusion carried over into the database implementation: we often mixed up when to create a table representing an entity versus when to create a table representing a relationship. These misunderstandings caused delays and led us to seek clarification from the TAs multiple times. Ultimately, it took time and repeated revisions for us to fully internalize the concepts and apply them correctly in a real project setting. For future teams, I would recommend verifying your interpretation of relationships early on and ensuring your UML diagram clearly maps to your relational schema before implementation. This can save a significant amount of rework later in the development process.

Lucy - One significant challenge I faced was connecting the frontend with the backend through API endpoints. Unlike isolated exercises in class, integrating these components in a full project required careful planning and foresight. I quickly realized that the choice of database system and backend architecture (e.g., virtual machine, GCP, or Supabase) directly impacted how the frontend and backend could communicate. Early misalignments between these layers led to connection errors and data inconsistencies. To address this, I had to thoroughly research the database options, plan the API structure in advance, and iteratively adjust both the frontend and backend implementations. For future projects, I would recommend designing the frontend-backend communication strategy upfront and ensuring compatibility with the chosen backend platform before starting implementation, as this can prevent significant integration issues later on.

**8. Are there other things that changed comparing the final application with the original proposal?**

No—there were no additional changes beyond what we have already discussed in the previous answers.

**9. Describe future work that you think, other than the interface, that the application can improve on.**

Beyond improving the interface, one major area for future enhancement is automating skill extraction using large language models (LLMs). Currently, our application relies entirely on manually curated database entries that list the skills required by each job or taught by each course. This means that adding a new job or course requires us to manually extract the relevant skills and input them into the system, which is time-consuming and prone to inconsistency.

Integrating an LLM to automatically identify and categorize skills from job descriptions or course syllabi would greatly increase efficiency and scalability. It would reduce manual work, keep the database more up-to-date, and allow the system to adapt to new job postings or course updates with minimal human intervention. Overall, this enhancement would make the application much more robust and practical for real-world use.

**10. Describe the final division of labor and how well you managed teamwork.**

After one team member dropped the course near the Checkpoint 1 deadline, the remaining three of us redistributed the workload evenly. Rather than dividing responsibilities strictly between frontend and backend (as described in the project proposal), we adopted a collaborative approach in which each member contributed to all parts of the project. We broke the work into smaller tasks within each component and selected tasks based on availability and skill. 

For example, in the advanced components, one person focused on implementing triggers and constraints while another worked on advanced queries. This flexible structure allowed us to support each other easily and maintain steady progress. Overall, our teamwork was smooth and effective; communication was strong, and no one disengaged or relied on others to carry the work.


## Project Video
[Link to Google Drive Folder](https://drive.google.com/drive/folders/1SVGctZ-qkI4DI8pQCes2VIeskFN__o2K?usp=drive_link)
