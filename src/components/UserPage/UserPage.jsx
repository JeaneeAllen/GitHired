import React, { useState, useEffect } from 'react';
import LogOutButton from '../LogOutButton/LogOutButton';
import { useSelector } from 'react-redux';
import axios from 'axios';

function UserPage() {
  // this component doesn't do much to start, just renders some user reducer info to the DOM
  const user = useSelector((store) => store.user);
  const ADZUNA_API_KEY = import.meta.env.VITE_ADZUNA_API_KEY;
  const ADZUNA_API_ID = import.meta.env.VITE_ADZUNA_API_ID;

  /*
  const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
  const ADZUNA_API_ID = process.env.ADZUNA_API_ID;
  */

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    axios
      .get(
        `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${ADZUNA_API_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=10&what=Software%20Engineer&where=Minnesota`
      )
      .then((res) => {
        console.log('GET Adzuna API success:', res.data);
        if (res.data && res.data.results) {
          setJobs(res.data.results);
        }
      })
      .catch((err) => {
        console.log('GET Adzuna API failed:', err);
      });
  };



  return (
    <div className="container">
      <h2>Welcome, {user.username}!</h2>
      <p>Your ID is: {user.id}</p>

      <h1>Job Listings</h1>
      <ul>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <li key={job.id}>
              <h2>{job.title}</h2>
              <p>{job.description}</p>
              <a href={job.redirect_url}>Apply</a>
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
