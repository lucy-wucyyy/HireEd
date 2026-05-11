# Database Implementation & Indexing

## Data Definition Language (DDL) Commands

### Users

```sql
CREATE TABLE Users (
    user_id int,
    user_name varchar(255),
    email varchar(255),
    major varchar(255),
    degree varchar(255),
    PRIMARY KEY (user_id)
);
```

### Institutions

```sql
CREATE TABLE Institutions (
    inst_id int,
    inst_name varchar(255),
    year_founded int,
    PRIMARY KEY (inst_id)
);
```

### Companies

```sql
CREATE TABLE Companies (
    company_id int,
    company_name varchar(255),
    company_profile text,
    PRIMARY KEY (company_id)
); 
```

### Courses

```sql
CREATE TABLE Courses (
    course_id int,
    subject varchar(255),
    course_title varchar(255),
    rating double DEFAULT,
    level varchar(255) DEFAULT,
    inst_id int DEFAULT,
    PRIMARY KEY (course_id),
    FOREIGN KEY (inst_id) REFERENCES Institutions (inst_id) ON DELETE CASCADE
);
```

### Jobs

```sql
CREATE TABLE Jobs (
    job_id int,
    job_title varchar(255),
    qualification varchar(255),
    salary_min int,
    salary_max int,
    company_id int,
    PRIMARY KEY (job_id),
    FOREIGN KEY (company_id) REFERENCES Companies (company_id) ON DELETE CASCADE
);
```

### Skills

```sql
CREATE TABLE Skills (
    job_id int,
    course_id int,
    skill_name varchar(255),
    PRIMARY KEY (job_id,course_id),
    FOREIGN KEY (job_id) REFERENCES Jobs (job_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses (course_id) ON DELETE CASCADE
);
```

### UsersCourses

```sql
CREATE TABLE UsersCourses (
    user_id int,
    course_id int,
    status enum('planned','completed') DEFAULT 'planned',
    date_added datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES Users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses (course_id) ON DELETE CASCADE
);
```

### UsersJobs

```sql
CREATE TABLE UsersJobs (
    user_id int,
    job_id int,
    status enum('saved','applied') DEFAULT 'saved',
    date_added datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES Users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs (job_id) ON DELETE CASCADE
);
```

### 3 Tables with >1000 Rows
```sql
SELECT COUNT(user_id) FROM Users;
SELECT COUNT(course_id) FROM Courses;
SELECT COUNT(job_id) FROM Jobs;
```

<img width="228" height="62" alt="Screenshot 2025-11-17 at 6 05 01 PM" src="https://github.com/user-attachments/assets/beb3aeec-29f5-46d0-962e-fcbde578fbba" />

<img width="228" height="62" alt="Screenshot 2025-11-17 at 6 05 06 PM" src="https://github.com/user-attachments/assets/d87fe49b-63d9-4c44-a5a7-beb574e56e9b" />

<img width="228" height="62" alt="Screenshot 2025-11-17 at 6 05 11 PM" src="https://github.com/user-attachments/assets/353d5991-1fdc-4db9-ac70-d89b2d32ded2" />

## Advanced Queries

### Advanced Query 1

**Goal:** Recommend courses for a target job (“Supply Chain Manager”) based on the most in-demand skills.

**Concepts** 
* Join multiple relations
* Aggregation via ```GROUP BY```
* Subqueries that cannot be easily replaced by a join

```sql
SELECT c.course_id, c.course_title, COUNT(s.skill_name) AS matched_skills
FROM Courses c
JOIN Skills s ON c.course_id = s.course_id
WHERE s.skill_name IN (
   SELECT skill_name
   FROM Skills
   WHERE job_id = (
       SELECT job_id
       FROM Jobs
       WHERE job_title = 'Supply Chain Manager'
       LIMIT 1
   )
)
GROUP BY c.course_id, c.course_title
ORDER BY matched_skills DESC
LIMIT 15;
```

**Results**

There are only 5 courses in the database that match the skills required for the “Supply Chain Manager” job.

<img width="2048" height="328" alt="image" src="https://github.com/user-attachments/assets/1985bf7b-0255-4568-b075-34fc32e30caf" />

### Advanced Query 2

**Goal:** For a given user, identify which jobs best match their learned skills.

**Concepts** 
* Join multiple relations
* Aggregation via ```GROUP BY```

```sql
SELECT
   j.job_id,
   j.job_title,
   c2.company_name,
   COUNT(DISTINCT s.skill_name) AS matching_skills
FROM Users u
JOIN UsersCourses uc ON u.user_id = uc.user_id
JOIN Courses c ON uc.course_id = c.course_id
JOIN Skills s ON c.course_id = s.course_id
JOIN Jobs j ON s.job_id = j.job_id
JOIN Companies c2 ON j.company_id = c2.company_id
WHERE u.user_id = 630
GROUP BY j.job_id, j.job_title, c2.company_name
HAVING COUNT(DISTINCT s.skill_name) > 0
ORDER BY matching_skills DESC
LIMIT 15;
```

**Results**

<img width="2048" height="863" alt="image" src="https://github.com/user-attachments/assets/94da93a7-9cef-484a-967b-d720ac83a609" />

### Advanced Query 3

**Purpose:** Suggest entities (companies or institutions) relevant to a user’s skills.

**Concepts:** 
* Join multiple relations
* ```SET``` Operators
* Aggregation via ```GROUP BY```

```sql
-- Companies with jobs matching user's skills
SELECT comp.company_name AS entity_name, 'Company' AS entity_type, COUNT(DISTINCT j.job_id) AS relevance_score
FROM Users u
JOIN UsersCourses uc ON u.user_id = uc.user_id
JOIN Skills s ON uc.course_id = s.course_id
JOIN Jobs j ON s.job_id = j.job_id
JOIN Companies comp ON j.company_id = comp.company_id
WHERE u.user_id = 101
GROUP BY comp.company_name

UNION

-- Institutions offering courses matching user's skills
SELECT inst.inst_name AS entity_name, 'Institution' AS entity_type, COUNT(DISTINCT c.course_id) AS relevance_score
FROM Users u
JOIN UsersCourses uc ON u.user_id = uc.user_id
JOIN Skills s ON uc.course_id = s.course_id
JOIN Courses c ON s.course_id = c.course_id
JOIN Institutions inst ON c.inst_id = inst.inst_id
WHERE u.user_id = 101
GROUP BY inst.inst_name

ORDER BY relevance_score DESC
LIMIT 15;
```

**Results**

<img width="2048" height="863" alt="image" src="https://github.com/user-attachments/assets/26629d36-4f60-4497-9075-626570f2ce68" />

### Advanced Query 4

**Purpose:** Identify most engaged users based on completed courses.

**Concepts**
* Join multiple relations
* Aggregation via ```GROUP BY```

```sql
SELECT u.user_id, u.user_name, COUNT(uc.course_id) AS courses_completed
FROM Users u
JOIN UsersCourses uc ON u.user_id = uc.user_id
WHERE uc.status = 'completed'
GROUP BY u.user_id, u.user_name
ORDER BY courses_completed DESC
LIMIT 15;
```

**Results**

<img width="2048" height="863" alt="image" src="https://github.com/user-attachments/assets/bbbbec69-e033-48e9-adb7-98b104a12937" />

## Indexing

### Advanced Query 1

**Output of ```EXPLAIN ANALYZE``` Before Indexing** Cost = 115871

<img width="1163" height="361" alt="Screenshot 2025-10-31 at 8 05 57 PM" src="https://github.com/user-attachments/assets/87a7cfe1-91aa-4c6f-a1be-548cc38c0b09" />

**Indexing Experiments**

| Index Attempt | Columns Indexed             | EXPLAIN ANALYZE Cost | Observations                  |
|---------------|-----------------------------|----------------------|-------------------------------|
| 1             | Skills(course_id)           | 117580               | higher than the default index |
| 2             | Skills(job_id, skill_name)  | 116690               | higher than the default index |
| 3             | Jobs(job_title)             | 117580               | higher than the default index |

**Final Index Design**

We decided not to add additional indexes because indexing attributes like ```job_title``` and ```course_id``` increased the query cost rather than reducing it. The default indexing design (with a cost of 115871) already provided the most efficient execution plan compared to our index attempts, which increased the cost to 117580. This suggests that MySQL’s existing indexes and query optimizer were already selecting an efficient access path for this query.

### Advanced Query 2

**Output of ```EXPLAIN ANALYZE``` Before Indexing:** Cost = 73448

<img width="1165" height="365" alt="Screenshot 2025-10-31 at 7 00 38 PM" src="https://github.com/user-attachments/assets/ed9c1e75-5c1f-4f46-b3a5-86138faa754b" />

**Indexing Experiments**

| Index Attempt | Columns Indexed                     | EXPLAIN ANALYZE Cost | Observations                  |
|---------------|-------------------------------------|----------------------|-------------------------------|
| 1             | Skills(job_id)                      | 79568                | higher than the default index |
| 2             | UsersCourses(user_id, course_id)    | 66936                | lower than the default index  |
| 3             | Jobs(job_id, job_title, company_id) | 86365                | higher than the default index |

**Final Index Design**

We decided to index ```user_id``` and ```course_id``` in the UsersCourses table because this part of the query is directly affected by the WHERE u.user_id = 630 filter and the subsequent join on course_id.
This composite index allows MySQL to efficiently retrieve all course IDs associated with that specific user in a single index scan, rather than performing repeated lookups. As a result, the query cost dropped from 73448 (default) to 66936, showing a clear improvement in performance for the most selective part of the query.

### Advanced Query 3

**Output of ```EXPLAIN ANALYZE``` Before Indexing** Cost = 15071

<img width="1151" height="513" alt="Screenshot 2025-10-31 at 9 13 41 PM" src="https://github.com/user-attachments/assets/e7586314-4c76-4e86-8f61-cae92ed9ddfc" />

**Indexing Experiments**

| Index Attempt | Columns Indexed                  | EXPLAIN ANALYZE Cost | Observations                 |
|---------------|----------------------------------|----------------------|------------------------------|
| 1             | UsersCourses(user_id, course_id) | 13957                | lower than the default index |
| 2             | Skills(job_id, course_id)        | 13807                | lower than the default index |
| 3             | Jobs(company_id)                 | 14770                | lower than the default index |

**Final Index Design**

We decided to index ```job_id``` and ```course_id``` because these attributes are central to the join operations that connect users’ courses to related jobs and institutions. By indexing these columns, MySQL can more efficiently locate matching skills across both parts of the UNION query. This reduced the query cost from 15071 (default) to 13807, making it the most effective indexing strategy among those tested.

### Advanced Query 4

**Output of ```EXPLAIN ANALYZE``` Before Indexing** Cost = 362

<img width="1163" height="137" alt="Screenshot 2025-10-31 at 9 35 06 PM" src="https://github.com/user-attachments/assets/e934d22b-e336-4c1a-a5b6-3f86739e79a8" />

**Indexing Experiments**

| Index Attempt | Columns Indexed               | EXPLAIN ANALYZE Cost | Observations                     |
|---------------|-------------------------------|----------------------|----------------------------------|
| 1             | UsersCourses(user_id)         | 169                  | lower than the default index     |
| 2             | UsersCourses(status)          | 136                  | lower than the default index     |
| 3             | UsersCourses(user_id, status) | 169                  | lower than the default index     |

**Final Index Design**

We decided to index ```status``` and ```UsersCourses``` because the query filters specifically on uc.status = 'completed'. This index allows MySQL to quickly retrieve only the relevant subset of completed courses before performing joins or grouping, significantly reducing the number of rows scanned. As a result, the query cost decreased from 362 (default) to 136, making it the most efficient indexing strategy among those tested.
