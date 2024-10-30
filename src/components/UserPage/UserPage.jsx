import React, { useState, useEffect } from 'react';
import LogOutButton from '../LogOutButton/LogOutButton';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import './UserPage.css';

function UserPage() {
  const user = useSelector((store) => store.user);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();

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
    await axios.post('/api/jobs', { ...job, user_id: user.id });
    dispatch({ type: 'SAVE_JOB', payload: job });
  };

  return (
    <div className="user-page-container">
      <div className="header">
        <h2>Welcome, {user.username}!</h2>
        <p>Embark on Your Next Adventure! Discover Exciting New Career Opportunities Below.</p>
      </div>

      <div className="search-container">
        <h1>Find Jobs</h1>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Job Title or Keywords"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
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
                <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">Apply</a>
                <div className="job-actions">
                  <button onClick={() => saveJob(job)} className="apply-button">Save</button>
                  <button className="decline-button">Remove</button>
                </div>
              </div>
            ))
          ) : (
            <p>Loading jobs...</p>
          )}
        </div>
        {jobs.length > 0 && (
          <button onClick={loadMoreJobs} className="next-button">Next</button>
        )}
      </div>
    </div>
  );
}

export default UserPage;
