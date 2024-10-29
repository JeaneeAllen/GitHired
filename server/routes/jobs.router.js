const express = require('express');
const axios = require('axios');
const router = express.Router();


router.get('/api/jobs/search', async (req, res) => {
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

module.exports = router;