import React, { useState, useEffect } from 'react';
import LogOutButton from '../LogOutButton/LogOutButton';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

function UserPage() {

  const user = useSelector((store) => store.user);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSavedJobs = async () => {
      const response = await axios.get(`/api/jobs/${user.id}`);
      setJobs(response.data);
    };
    fetchSavedJobs();
  }, [user.id]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const response = await axios.get('/api/jobs/search', {
      params: { keywords, location }
    });
    console.log(response.data);
    setJobs(response.data);
  };

  const saveJob = async (job) => {
    await axios.post('/api/jobs', { ...job, user_id: user.id });
    dispatch({ type: 'SAVE_JOB', payload: job });
  };


  return (
    <div className="container">
      <h2>Welcome, {user.username}!</h2>
      <p>Your ID is: {user.id}</p>

      <h1>Find Jobs</h1>
      <form onSubmit={handleSearch}>
        <input type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Job Title or Keywords" />

        <input type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location" />

        <button type="submit">Search</button>
      </form>

      <h1>Job Listings</h1>
      <ul>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <li key={job.id}>
              <h2>{job.title}</h2>
              <p>{job.description}</p>
              <a href={job.redirect_url}>Apply</a>
              <div className="job-actions">
                  <button onClick={() => saveJob(job)} className="apply-button" >Save</button>
                  <button className="decline-button">Remove</button>
                </div>
            </li>
          ))
        ) : (
          <p>Loading jobs...</p>
        )}
      </ul>

      <LogOutButton className="btn" />
    </div>
  );
}

// this allows us to use <App /> in index.js
export default UserPage;
