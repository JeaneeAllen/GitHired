const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../modules/pool');
const {
    rejectUnauthenticated,
} = require('../modules/authentication-middleware');

// Every jobs route requires a logged in user
router.use(rejectUnauthenticated);

// Fetch jobs from Adzuna based on keywords and location.
// matchAny=true matches listings containing any of the words instead of all of them.
router.get('/search', async (req, res) => {
    const { keywords, location, page = 1, matchAny } = req.query;
    const keywordParam = matchAny === 'true'
        ? { what_or: (keywords || '').replace(/,/g, ' ') }
        : { what: keywords };
    try {
        const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/us/search/${page}`, {
            params: {
                app_id: process.env.ADZUNA_API_ID,
                app_key: process.env.ADZUNA_API_KEY,
                results_per_page: 10,
                ...keywordParam,
                where: location
            }
        });
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching jobs from Adzuna:', error.message);
        res.status(500).json({ error: 'Failed to fetch jobs from Adzuna' });
    }
});

const savedJobsQuery = `
    SELECT
        j.id AS job_id,
        j.title,
        j.company,
        j.created,
        j.description,
        j.redirect_url,
        j.external_job_id,
        a.id AS application_id,
        a.date_applied,
        a.resume_link,
        a.application_status,
        a.interview_details,
        a.contact_info
    FROM
        jobs j
    LEFT JOIN
        applications a ON j.id = a.job_id AND a.user_id = j.user_id
    WHERE
        j.user_id = $1`;

// Get the logged in user's saved jobs (with application details, if any)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`${savedJobsQuery} ORDER BY j.id;`, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching saved jobs:', error);
        res.status(500).json({ error: 'Failed to retrieve saved jobs' });
    }
});

// Get one of the logged in user's saved jobs
router.get('/:jobId', async (req, res) => {
    try {
        const result = await pool.query(`${savedJobsQuery} AND j.id = $2;`, [req.user.id, req.params.jobId]);
        if (result.rows.length === 0) {
            return res.sendStatus(404);
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching saved job:', error);
        res.status(500).json({ error: 'Failed to retrieve saved job' });
    }
});

// Save a job for the logged in user
router.post('/', async (req, res) => {
    const { external_job_id, title, company, created, description, redirect_url } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO jobs (
                external_job_id, title, company, created, description, redirect_url, user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [external_job_id, title, company, created, description, redirect_url, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            // unique_violation: this user already saved this Adzuna job
            return res.status(409).json({ error: 'Job already saved' });
        }
        console.error('Error saving job:', error);
        res.status(500).json({ error: 'Failed to save job' });
    }
});

// Save (create or update) application details for one of the user's jobs
router.post('/applications', async (req, res) => {
    const { job_id, date_applied, resume_link, application_status, interview_details, contact_info } = req.body;
    const userId = req.user.id;
    // Every detail field is optional; store blank fields as NULL (an empty string isn't a valid DATE)
    const details = [date_applied, resume_link, application_status, interview_details, contact_info]
        .map((value) => (value === '' || value === undefined ? null : value));
    const values = [job_id, userId, ...details];

    try {
        const job = await pool.query('SELECT id FROM jobs WHERE id = $1 AND user_id = $2;', [job_id, userId]);
        if (job.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        let result = await pool.query(
            `UPDATE applications SET
                date_applied = $3, resume_link = $4, application_status = $5,
                interview_details = $6, contact_info = $7
            WHERE job_id = $1 AND user_id = $2 RETURNING *`,
            values
        );
        if (result.rows.length === 0) {
            result = await pool.query(
                `INSERT INTO applications (
                    job_id, user_id, date_applied, resume_link, application_status,
                    interview_details, contact_info
                ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                values
            );
        }
        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save application',
        });
    }
});

// Delete one of the user's saved jobs and its application details
router.delete('/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user.id;

    try {
        await pool.query('DELETE FROM applications WHERE job_id = $1 AND user_id = $2;', [jobId, userId]);
        const result = await pool.query('DELETE FROM jobs WHERE id = $1 AND user_id = $2;', [jobId, userId]);
        if (result.rowCount === 0) {
            return res.sendStatus(404);
        }
        res.sendStatus(204);
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

module.exports = router;
