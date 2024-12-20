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
        // Map over the results to include the company name and external job ID
        const jobsWithCompanyNames = response.data.results.map(job => ({
            ...job,
            companyName: job.company.display_name, // Extracting the company name
            created: job.created,  // Make sure `created` is included if it exists
            description: job.description,
            redirect_url: job.redirect_url,  // Make sure `redirect_url` is correctly mapped
            external_job_id: job.id,  // Map Adzuna's job ID
        }));

        // Send back the modified jobs
        res.json(jobsWithCompanyNames);
    } catch (error) {
        console.error('Error fetching jobs from Adzuna:', error);
        res.status(500).json({ error: 'Failed to fetch jobs from Adzuna' });
    }
});

// POST route to save a job
router.post('/', async (req, res) => { // Changed path to /jobs
    const { title, company, created, description, redirect_url, user_id, external_job_id } = req.body;

    // Parse the company name from JSON if it is a JSON object

    try {
        const result = await pool.query(
            `INSERT INTO jobs (
                title, company, created, description, redirect_url, user_id, external_job_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, company, created, description, redirect_url, user_id, external_job_id] // Use external_job_id directly
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({ error: 'Failed to save job' });
    }
});

// Route to get all jobs
router.get('/all-jobs', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                jobs.company,
                jobs.title,
                jobs.created AS job_created,
                jobs.description AS job_description,
                jobs.redirect_url AS job_redirect_url,
                jobs.external_job_id,
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
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve jobs',
            error: error.message,
        });
    }
});

router.delete('/:external_job_id', async (req, res) => {
    const jobId = req.params.external_job_id;
    console.log("Attempting to delete job with external_job_id:", jobId);

    try {
        // Delete related application entries first
        console.log("Deleted applications for job with external_job_id:", jobId);

        // Then delete from jobs table using the external_job_id
        const jobResult = await pool.query('DELETE FROM jobs WHERE external_job_id = $1 RETURNING *', [jobId]);
        console.log("Job delete result:", jobResult);

        if (jobResult.rowCount === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json({ success: true, message: 'Job and related application data removed successfully' });
    } catch (error) {
        console.error('Error deleting job and applications:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/user_id', async (req, res) => {
    const { user_id } = req.query;  // Accessing user_id from query parameters
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      const result = await pool.query(
        `SELECT 
          j.id AS job_id,
          j.title,
          j.company,
          j.created,
          j.description,
          j.redirect_url,
          j.external_job_id,
          a.date_applied,
          a.resume_link,
          a.application_status,
          a.interview_details,
          a.contact_info,
          a.external_job_id AS application_external_job_id
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id AND a.user_id = $1
        WHERE j.user_id = $1`, [user_id]
      );
      
      res.status(200).json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching user jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve jobs by user ID',
        error: error.message,
      });
    }
  });
  


module.exports = router;