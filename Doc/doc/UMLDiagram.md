# UML Diagram & Relational Schema

## UML Diagram
<img width="5089" height="2264" alt="image" src="https://github.com/user-attachments/assets/5d1097b5-7fd2-4a46-85f5-f82219743edb" />

## Explaining Assumptions

### Entities
* **Users:** Represents the users of the system, primarily college students. In addition to standard user information, it includes academic details. Attributes include:
  * ```user_id``` (Primary Key)
  * ```username``` 
  * ```email``` 
  * ```major``` 
  * ```degree``` 

* **Courses:** Contains information about educational courses. Attributes include:
  * ```course_id``` (Primary Key)
  * ```subject```
  * ```course_title```
  * ```level```
  * ```rating```

* **Institutions:** Contains information about institutions that provide courses. Attributes include:
  * ```inst_id``` (Primary Key)
  * ```inst_name```
  * ```year_founded```

* **Jobs:** Represents job listings posted by companies. Each job is associated with one company. Attributes include:
  * ```job_id``` (Primary Key)
  * ```job_title```
  * ```qualification```
  * ```salary_min```
  * ```salary_max```

* **Companies:** Contains information about companies that post jobs. Attributes include:
  * ```company_id``` (Primary Key)
  * ```company_name```
  * ```company_profile```
  * ```size```

### Relationships
* _**Enrollments:**_ This is a **many-many** relationship between _Users_ and _Courses_. A user can take multiple courses, and a course can be taken by multiple users.
* _**Interested Jobs:**_ This is a **many-many** relationship between _Users_ and _Jobs_. A user can save multiple jobs, and a job can be saved by multiple users.
* _**Offered Courses:**_ This is a **1-many** relationship between _Institutions_ and _Courses_. An institution can provide multiple courses, but a course cannot be provided by multiple institutions. Even if multiple institutions have similar courses, each course is considered distinct because it belongs to a specific institution.
* _**Job Lists:**_ This is a **1-many** relationship between _Companies_ and _Jobs_. A company can have multiple jobs, but a job cannot be linked to multiple companies. Even if multiple companies have similar positions, each job is considered distinct because it belongs to a specific company.
* _**Skills:**_ This is a **many-many** relationship between _Courses_ and _Jobs_. A course can allow the user to acquire multiple skills, and a job can require the user to have multiple skills.

## Normalizing Database

### Functional Dependencies

  * ```user_id``` → {```username```, ```email```, ```major```, ```degree```}
  * ```course_id``` → {```subject```, ```course_title```, ```level```, ```rating```}
  * ```inst_id``` → {```inst_name```, ```year_started```}
  * ```job_id``` → {```job_title```, ```qualification```, ```salary_min```, ```salary_max```, ```company_id```}
  * ```company_id``` → {```company_name```, ```company_profile```, ```size```}

For each entity table, the primary key is the only candidate key, and all non-key attributes are fully functionally dependent on the primary key with no transitive dependencies. Therefore, all entity tables satisfy BCNF.

For the relationship table, each table has a composite primary key consisting of foreign keys from the participating entities. Since these tables contain only key attributes (or attributes that are part of functional dependencies where the determinant is the entire candidate key), they also satisfy BCNF.

Therefore, the entire database schema is in BCNF.

## Converting UML Diagram to Relational Schema

  * **Users** (```user_id```: INT [PK], ```username```: VARCHAR(255), ```email```: VARCHAR(255), ```major```: VARCHAR(255), ```degree```: VARCHAR(255))

  * **Courses** (```course_id```: INT [PK], ```subject```: VARCHAR(255), ```course_title```: VARCHAR(255), ```level```: VARCHAR(255), ```rating```: DECIMAL(3,2), ```inst_id```:INT [FK to ```Institutions.inst_id```])

  * **Institutions** (```inst_id```: INT [PK], ```inst_name```: VARCHAR(255), ```year_founded```: INT)

  * **Jobs** (```job_id```: INT [PK], ```job_title```: VARCHAR(255), ```qualification```: VARCHAR(255), ```salary_min```: DECIMAL(10,2), ```salary_max```: DECIMAL(10,2), ```company_id```: INT [FK to ```Companies.company_id```])

  * **Companies** (```company_id```: INT [PK], ```company_name```: VARCHAR(255), ```company_profile```: TEXT, ```size```: VARCHAR(255))

  * **Enrollments** (```user_id```: INT [PK] [FK to ```Users.user_id```], ```course_id```: INT [PK] [FK to ```Courses.course_id```])

  * **Interested_Jobs** (```user_id```: INT [PK] [FK to ```Users.user_id```], ```job_id```: INT [PK] [FK to ```Jobs.job_id```])

  * **Offered Courses** (```inst_id```: INT [PK] [FK to ```Institutions.inst_id```], ```course_id```: INT [PK] [FK to ```Courses.course_id]```)

  * **Job Lists** (```company_id```: INT [PK] [FK to ```Companies.company_id```], ```job_id```: INT [PK] [FK to ```Jobs.job_id```])

  * **Skills** (```course_id```: INT [PK] [FK to ```Courses.course_id```], ```job_id```: INT [PK] [FK to ```Jobs.job_id```], ```skill_name```: VARCHAR(255))
