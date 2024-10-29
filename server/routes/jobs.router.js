const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../modules/pool')


router.get('/search', async (req, res) => {
    const { keywords, location } = req.query;
    try {
        const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/us/search/1`, {
            params: {
                app_id: process.env.ADZUNA_API_ID,
                app_key: process.env.ADZUNA_API_KEY,
                results_per_page: 10,
                what: keywords,
                where: location
            }
        });
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching jobs from Adzuna:', error);
        res.status(500).json({ error: 'Failed to fetch jobs from Adzuna' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM jobs WHERE user_id = $1', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to retrieve jobs' });
    }
});

module.exports = router;