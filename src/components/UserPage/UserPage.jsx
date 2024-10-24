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
  const [searchCriteria, setSearchCriteria] = useState({
    title: '',
    salary: '',
    location: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    const { title, salary, location} = searchCriteria;
    const query = `app_id=${ADZUNA_API_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=10&what=${title}&where=${location}&salary=${salary}`;

    axios.get(`https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=3a445b32&app_key=2a3be081fe252abbfd5bbe54a0e5df31&results_per_page=10&what=software%20engineer&where=minnesota&salary_min=60000&salary_max=90000`)
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

      <h1>Find Jobs</h1>
      <input
        type="text"
        placeholder="Job Title or Keywords"
      />
      <input
        type="text"
        placeholder="Location"
      />
      <input
        type="text"
        placeholder="Salary"
      />

      <button>Search</button>

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
