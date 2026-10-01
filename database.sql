-- USER is a reserved keyword with Postgres
-- You must use double quotes in every query that user is in:
-- ex. SELECT * FROM "user";
-- Otherwise you will have errors!
CREATE TABLE "user" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR (80) UNIQUE NOT NULL,
    "password" VARCHAR (1000) NOT NULL
);

CREATE TABLE "jobs" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "user" ON DELETE CASCADE,
    "title" VARCHAR (255),
    "company" VARCHAR (255),
    "created" TIMESTAMP,
    "description" TEXT,
    "redirect_url" VARCHAR (2048)
);

CREATE TABLE "applications" (
    "id" SERIAL PRIMARY KEY,
    "job_id" INT NOT NULL REFERENCES "jobs" ON DELETE CASCADE,
    "user_id" INT NOT NULL REFERENCES "user" ON DELETE CASCADE,
    "date_applied" DATE,
    "resume_link" VARCHAR (2048),
    "application_status" VARCHAR (100),
    "interview_details" TEXT,
    "contact_info" VARCHAR (255),
    UNIQUE ("job_id", "user_id")
);
