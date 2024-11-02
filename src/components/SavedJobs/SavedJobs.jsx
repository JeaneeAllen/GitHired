import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import './SavedJobs.css';

function SavedJobs() {
  const savedJobs = useSelector((state) => state.jobs.savedJobs);
  const dispatch = useDispatch();


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

  return (
    <div className="container">
      <h2>My Saved Jobs</h2>

      <table className="jobs-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Job Title</th>
            <th>Job Listing Date</th>
            <th>Job Description</th>
            <th>Date Applied</th>
            <th>Resume & Cover Letter Link</th>
            <th>Application Status</th>
            <th>Interview Details</th>
            <th>Contact Info</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(savedJobs || []).map((job) => (
            <tr key={job.id || job.job_id}>
              <td>{job.company || 'N/A'}</td>
              <td>{job.title || 'N/A'}</td>
              <td>{new Date(job.job_created).toLocaleDateString() || 'N/A'}</td>
              <td>{job.job_description || 'N/A'}</td>
              <td>{job.date_applied || 'N/A'}</td>
              <td>{job.resume_link ? <a href={job.resume_link}>Link</a> : 'N/A'}</td>
              <td>{job.application_status || 'N/A'}</td>
              <td>{job.interview_details || 'N/A'}</td>
              <td>{job.contact_info || 'N/A'}</td>

              <td>
                <button onClick={() => window.open(job.job_redirect_url, '_blank')}>Apply</button>
                <button>Add Details</button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SavedJobs;
