import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

function HomePage() {
  const user = useSelector((store) => store.user);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const history = useHistory();

  const fetchJobs = async (searchKeywords, searchLocation, currentPage) => {
    const response = await axios.get('/api/jobs/search', {
      params: {
        keywords: searchKeywords,
        location: searchLocation,
        page: currentPage
      }
    });
    return response.data;
  };

  useEffect(() => {
    const fetchDefaultJobs = async () => {
      const defaultJobs = await fetchJobs('Software Engineer', 'Minnesota', page);
      setJobs(defaultJobs);
    };
    fetchDefaultJobs();
  }, [page]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const newJobs = await fetchJobs(keywords, location, 1);
    setJobs(newJobs);
    setPage(1);
  };

  const loadMoreJobs = async () => {
    const newJobs = await fetchJobs(keywords, location, page + 1);
    setJobs((prevJobs) => [...prevJobs, ...newJobs]);
    setPage(page + 1);
  };

  const saveJob = async (job) => {
    console.log("Saving job:", job); // Log job to verify data structure
    try {
      const jobResult = await axios.post('/api/jobs', {
        title: job.title,
        company: job.company,
        created: job.created,
        description: job.description,
        redirect_url: job.redirect_url,
        user_id: user.id, // Ensure user.id is defined and valid
        external_job_id: job.id
      });
      console.log("Job saved response:", jobResult.data); // Check backend response
      dispatch({ type: 'SAVE_JOB', payload: jobResult.data });
      alert(`Job "${job.title}" saved successfully!`);
      history.push('/savedjobs');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
    }
  };

  const removeListing = (job) => {
    setJobs((prevJobs) => prevJobs.filter((j) => j.id !== job.id)); // Update state to remove job from list
    alert(`Job "${job.title}" removed from the list.`);
  };

  return (
    <div className="user-page-container">
      <div className="header">
        <h2>Welcome, {user.username}!</h2>
        <p>Embark on Your Next Adventure! Discover Exciting New Career Opportunities Below!</p>
      </div>

      <div className="search-container">
        <h1>Find Jobs</h1>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Job Title or Keywords"
            id="job-keywords"
            name="job-keywords"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            id="job-location"
            name="job-location"
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="job-listings-container">
        <h1>Job Listings</h1>
        <div className="job-grid">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-info">
                  <h2>{job.title}</h2>
                  <p>{job.description}</p>
                </div>
                <div className="job-actions">
                  <button onClick={() => saveJob(job)} className="apply-button">Save</button>
                  <button onClick={() => removeListing(job)} className="decline-button">Remove</button>
                </div>
              </div>
            ))
          ) : (
            <p>No jobs found. Please try a different search.</p>
          )}
        </div>
        {jobs.length > 0 && (
          <button onClick={loadMoreJobs} className="next-button">Next</button>
        )}
      </div>
    </div>
  );
}

export default HomePage;
