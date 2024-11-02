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
                results_per_page: 10,
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
        res.status(201).json({
            success: true,
            data: result.rows[0], // Include the saved application in the response
        });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save application',
            error: error.message,
        });
    }
});

router.post('/', async (req, res) => {
    const { title, company, created, description, redirect_url, user_id } = req.body;

    // Parse the company name from JSON if it is a JSON object
    const companyName = typeof company === 'string' ? JSON.parse(company).display_name : company;

    try {
        const result = await pool.query(
            `INSERT INTO jobs (
                title, company, created, description, redirect_url, user_id
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, companyName, created, description, redirect_url, user_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({ error: 'Failed to save job' });
    }
});

// Route to get all jobs
router.get('/jobs/all-jobs', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                jobs.company,
                jobs.title,
                jobs.created AS job_created,
                jobs.description AS job_description,
                jobs.redirect_url AS job_redirect_url,
                applications.date_applied,
                applications.resume_link,
                applications.application_status,
                applications.interview_details,
                applications.contact_info
            FROM 
                jobs
            LEFT JOIN 
                applications ON jobs.id = applications.job_id
            LEFT JOIN 
                "user" ON applications.user_id = "user".id;
        `);
        // Success response
        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Error fetching all jobs:', error);
        // Error response
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve jobs',
            error: error.message,
        });
    }
});


// Export the router
module.exports = router;