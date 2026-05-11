# Project Proposal - _HireEd_

## Project Summary
_**HireEd**_ aims to design and implement a database system that bridges the gap between academic courses and career requirements. Many students struggle to identify which courses best prepare them for the jobs they aspire to pursue. Our system integrates labor market skill data with course catalog information to generate personalized recommendations.

The recommender will allow users to input a desired career (e.g. Data Scientist, UX Designer) and receive a ranked list of relevant courses that cover the most in-demand skills for that occupation. Conversely, students can input the courses they have already taken and see which jobs they are best aligned with, along with suggestions for additional courses to fill skill gaps.

## Purpose
This application is designed to enhance the job-search experience for college students by helping them better connect their academic background with job opportunities. One common challenge students face during the recruiting season is spending significant time reading through job descriptions and manually identifying how their coursework aligns with required skills. To address this, the application will allow users to filter and discover job postings based on the specific courses they have taken, streamlining the process of identifying relevant opportunities.

Conversely, for students who already have a clear career goal in mind, it can be difficult to determine which courses will best prepare them for their desired role. To support this need, the application will also include a reverse matching feature: users can input a job title or description, and the system will recommend courses that teach the skills required for that role. This dual approach ensures students are supported whether they are searching for jobs based on their existing academic experience or planning their coursework to align with future career goals.

## Technically Challenging Features / Creative Component
One potential creative component is allowing users to upload a job description, which our application would process using AI models to automatically extract the skills required for that role. The identified skills would be compared against the student's completed or planned coursework to determine which skills they already have and which ones are missing. The application would then generate a personalized list of recommended courses that cover the missing skills. This feature would save students significant time while ensuring a more tailored mapping between education and industry demands.
Based on this, we could also build an interactive dashboard that visualizes the overlap between the user's coursework and job requirements. A student could dynamically explore the skills they have and the skills they need, which could then lead to a panel listing courses they could take for specific skills. This dashboard could include a network graph of courses, skills, and jobs, allowing students to trace how different people who took the same course end up in different career paths. To implement this feature, we will use graph-based visualization libraries like D3.js to allow the dashboard to update interactively as the user selects different career goals or courses.

## Usefulness
This application is especially useful for college students who are navigating the often overwhelming process of job searching and academic planning. It offers a streamlined platform that connects job listings with a student's completed or planned coursework, helping users quickly identify which jobs align with the skills they've acquired in class. This saves time by eliminating the need to manually compare job descriptions with resumes or syllabi. The application also supports reverse searching — allowing students to input a desired job title or role and receive a list of recommended courses that can help them build the required skills. This dual functionality helps both students who are actively job hunting and those who are planning their academic path based on long-term career goals.

While job boards like LinkedIn or Handshake allow users to search for positions, they do not typically provide an intelligent way to filter jobs based on the student’s actual academic history or recommend coursework based on job goals. Similarly, university course catalogs often lack real-world job alignment features. Our application fills this gap by acting as a bridge between university education and industry demands. It integrates job data and course data in a meaningful way, offering personalized recommendations that are not available in existing systems. This unique combination of academic and career data makes the tool especially valuable for students who want to make smarter, data-driven decisions about their education and employment journey.

## Realness
The application is grounded in two large, real-world datasets that provide both scale and authenticity to the project.

**_1. O*NET® 30.0 Database_**
ONET (Occupational Information Network) is a comprehensive database developed under the sponsorship of the U.S. Department of Labor. It includes detailed information on over 1,000 occupations across industries, with data on the knowledge, skills, abilities, and work activities that are important for success in each role. The database also assigns importance and level ratings to each skill, which makes it possible to distinguish between “must-have” skills and secondary or optional skills. ONET is widely used by career counselors, workforce planners, and researchers, ensuring that the job-related insights generated by our project are realistic and aligned with actual labor market demands.

**_2. Coursera Courses and Skills Dataset (2025, Kaggle)_**
This dataset contains 2,762 online courses offered on Coursera, one of the largest e-learning platforms in the world. Each course entry includes rich metadata such as the course title, subject category, associated skills, difficulty level (beginner, intermediate, advanced), user ratings, number of reviews, and detailed descriptions. Because the dataset already identifies “gained skills” for each course, it can be directly connected to the skills defined in O*NET, allowing us to map educational content to occupational requirements. With thousands of courses spanning topics from data science and business to humanities and personal development, the dataset provides the diversity and volume needed for meaningful recommendations.

By integrating these two datasets, the project ensures both sides of the “education-to-employment” pipeline are represented:
* O*NET defines what the job market requires.
* Coursera shows what courses can teach.

Both datasets contain well over 1,000 entries, easily meeting the scale requirement for a database systems project. Together, they form a robust foundation for building a recommendation system that is not only technically challenging but also practically useful to students and professionals.

## Functionality
User Accounts
* Create: A new user can sign up by submitting a form with their name, email, major, and graduation year.
* Read: The user can view their profile and saved data (e.g., completed courses, saved jobs).
* Update: The user can edit their profile details and academic history.
* Delete: The user can delete their account, which removes all associated data (courses, preferences, saved jobs).

Courses
* Create: The user can add completed or planned courses to their profile by selecting from a searchable course catalog.
* Read: The user can view all added courses in their profile, including course descriptions and associated skills.
* Update: The user can change the status of a course (e.g., planned → completed).
* Delete: The user can remove a course from their academic history.

Jobs
* Read/Search:
  * Filter jobs by skills learned in selected courses.
  * Search by title, company, location, or keyword.
  * View detailed job descriptions, required skills, and links to apply.
* Save (Create): Users can bookmark jobs for later viewing.
* Delete: Users can remove saved jobs from their profile.

Reverse Matching (Job → Courses)
* Input: User can enter a job title or description manually.
* Output: The system suggests a list of relevant courses that cover the skills required for that job.
* Save (Create): Users can bookmark suggested courses or add them to their planned academic path.

Skills Mapping (Behind the Scenes)
* When a course is added, the app uses a skills database to associate the course with a list of relevant job-ready skills.
* When viewing a job, the app matches the job’s required skills to the skills learned from the user’s completed courses.

## UI Mockup
![UI Mockup](https://github.com/cs411-alawini/fa25-cs411-team121-121/blob/main/doc/UIMockup.png)

## Work Distribution
We will divide our project into two groups, frontend and backend, while ensuring collaboration across both so that every team member gains experience with the entire development process. Frontend members (Eunice and Anish) will focus on designing and implementing the user interface, making sure all components are functional, connecting to backend API, and creating visual components including the interactive dashboard, charts, and input forms. Backend members (Josephine and Lucy) will handle the data ETL process, design the database, and connect and test external APIs or AI models for job description features and bi-directional search. 
Although responsibilities will be split, we plan to maintain overlap between the groups with each member assisting in different areas when necessary and all members participating in documentation and testing processes. Potential tools we could use for frontend include React, Chart.js, and D3.js for visualizations and other components. For the backend, we could use Python for Flask and other libraries.
