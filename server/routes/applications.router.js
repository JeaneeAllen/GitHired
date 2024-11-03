const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../modules/pool');

// POST route to save job details about an application
router.post('/', async (req, res) => {
    const { external_job_id, user_id, date_applied, resume_link, application_status, interview_details, contact_info } = req.body;

    try {
        // Retrieve the job_id using the external_job_id
        const jobResult = await pool.query('SELECT id FROM jobs WHERE external_job_id = $1', [external_job_id]);
        if (jobResult.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const job_id = jobResult.rows[0].id; // This is now correctly set from the query

        // Insert the application details
        const result = await pool.query(
            `INSERT INTO applications (
                job_id, external_job_id, user_id, date_applied, resume_link, application_status,
                interview_details, contact_info
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [job_id, external_job_id, user_id, date_applied, resume_link, application_status, interview_details, contact_info]
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


// Export the router
module.exports = router;