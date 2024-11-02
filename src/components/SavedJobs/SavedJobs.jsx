import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import './SavedJobs.css';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

function SavedJobs() {
  const savedJobs = useSelector((state) => state.jobs.savedJobs);
  const dispatch = useDispatch();
  const history = useHistory();


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs/jobs/all-jobs');
        if (response.data.success) {
          dispatch({ type: 'LOAD_SAVED_JOBS', payload: response.data.data });
        } else {
          console.error('Failed to fetch jobs:', response.data.message);
          // Handle the case where the API was reached but did not succeed
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Handle fetch error (e.g., network issue)
      }
    };
    fetchJobs();
  }, [dispatch]);

  const handleClick = async (event) => {
    event.preventDefault();
    history.push('/user');
  };

  const handleDetails = async (event) => {
    event.preventDefault();
    history.push('/JobDetails');
  };

   // Function to extract company name
   const getCompanyName = (company) => {
    try {
      // Check if the company is a JSON string
      const parsedCompany = JSON.parse(company);
      return parsedCompany.display_name || 'N/A';
    } catch (error) {
      // If parsing fails, return the company string directly
      return company || 'N/A';
    }
  };
  

  return (
    <div className="container">
      <h2>My Saved Jobs</h2>
      

      <table className="jobs-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Job Title</th>
            <th>Job Listing Date</th>
            <th>Date Applied</th>
            <th>Resume & Cover Letter Link</th>
            <th>Application Status</th>
            <th>Interview Details</th>
            <th>Contact Info</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(savedJobs || []).map((job, index) => (
            <tr key={job.id || job.job_id || index}>
              <td>{getCompanyName(job.company)}</td>
              <td>{job.title || 'N/A'}</td>
              <td>{new Date(job.job_created).toLocaleDateString() || 'N/A'}</td>
              <td>{job.date_applied || 'N/A'}</td>
              <td>{job.resume_link ? <a href={job.resume_link}>Link</a> : 'N/A'}</td>
              <td>{job.application_status || 'N/A'}</td>
              <td>{job.interview_details || 'N/A'}</td>
              <td>{job.contact_info || 'N/A'}</td>

              <td>
                <button onClick={() => window.open(job.job_redirect_url, '_blank')}>Apply ✔</button>
                <button onClick={handleDetails}> ✏️ Add Details</button>
                <button onClick={handleClick}> ⬅ Back to Search</button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SavedJobs;
