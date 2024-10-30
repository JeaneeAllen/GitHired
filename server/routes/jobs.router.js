const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../modules/pool');

// Fetch jobs from Adzuna based on keywords and location
router.get('/search', async (req, res) => {
    const { keywords, location, page = 1 } = req.query;
    console.log("Fetching jobs with:", { keywords, location, page }); // Log parameters
    try {
        const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/us/search/${page}`, {
            params: {
                app_id: process.env.ADZUNA_API_ID,
                app_key: process.env.ADZUNA_API_KEY,
                results_per_page: 8,
                what: keywords,
                where: location
            }
        });
        console.log("Fetched jobs from Adzuna:", response.data.results); // Log response
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching jobs from Adzuna:', error);
        res.status(500).json({ error: 'Failed to fetch jobs from Adzuna' });
    }
});

// Get saved jobs for a specific user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM jobs INNER JOIN applications ON jobs.id = applications.job_id WHERE applications.user_id = $1', 
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching saved jobs:', error);
        res.status(500).json({ error: 'Failed to retrieve saved jobs' });
    }
});

// Save a job application
router.post('/applications', async (req, res) => {
    const { job_id, user_id, date_applied, resume_link, application_status, interview_details, contact_info } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO applications (
                job_id, user_id, date_applied, resume_link, application_status,
                interview_details, contact_info
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [job_id, user_id, date_applied, resume_link, application_status, interview_details, contact_info]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({ error: 'Failed to save application' });
    }
});

// Save a job listing (insertion)
router.post('/', async (req, res) => {
    const {title, company, created, description, redirect_url } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO jobs (
                title, company, created, description, redirect_url
            ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, company, created, description, redirect_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({ error: 'Failed to save job' });
    }
});

module.exports = router;
