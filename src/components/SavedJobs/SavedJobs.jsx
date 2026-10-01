import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './SavedJobs.css';

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : 'N/A');

function SavedJobs() {
  const savedJobs = useSelector((state) => state.jobs.savedJobs);
  const dispatch = useDispatch();
  const history = useHistory();

  const removeJob = async (job) => {
    if (!window.confirm(`Remove "${job.title}" from My Jobs?`)) {
      return;
    }
    try {
      await axios.delete(`/api/jobs/${job.job_id}`);
      dispatch({ type: 'REMOVE_SAVED_JOB', payload: job.job_id });
    } catch (error) {
      console.error('Error removing job:', error);
      alert('Failed to remove job. Please try again.');
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        dispatch({ type: 'LOAD_SAVED_JOBS', payload: response.data });
      } catch (error) {
        console.error('Error fetching jobs:', error);
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
            <th className="description-col">Job Description</th>
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
            <tr key={job.job_id}>
              <td>{job.company || 'N/A'}</td>
              <td>{job.title || 'N/A'}</td>
              <td>{formatDate(job.created)}</td>
              <td className="description-col">{job.description || 'N/A'}</td>
              <td>{formatDate(job.date_applied)}</td>
              <td>{job.resume_link ? <a href={job.resume_link} target="_blank" rel="noreferrer">Link</a> : 'N/A'}</td>
              <td>{job.application_status || 'N/A'}</td>
              <td>{job.interview_details || 'N/A'}</td>
              <td>{job.contact_info || 'N/A'}</td>

              <td>
                <button className="apply-button" onClick={() => window.open(job.redirect_url, '_blank', 'noopener')}>Apply</button>
                <button className="details-button" onClick={() => history.push(`/JobDetails/${job.job_id}`)}>Add Details</button>
                <button className="remove-button" onClick={() => removeJob(job)}>Remove Job</button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SavedJobs;
