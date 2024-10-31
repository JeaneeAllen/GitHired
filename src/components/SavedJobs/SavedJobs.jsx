import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './SavedJobs.css';

function SavedJobs() {
  const [jobData, setJobData] = useState([]);
  const user = useSelector((store) => store.user); // Get the current user

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await axios.get(`/api/jobs/${user.id}`);
        setJobData(response.data);
        console.log('Fetched jobs:', response.data); // Log fetched data for debugging
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      }
    };
    fetchSavedJobs();
  }, [user.id]);

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
            <th>Interview Date, Time, and Location</th>
            <th>Contact Info</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobData.length > 0 ? (
            jobData.map((job, index) => (
              <tr key={index}>
                <td>{job.company}</td>
                <td>{job.title}</td>
                <td>{new Date(job.created).toLocaleDateString()}</td>
                <td>{job.description}</td>
                <td>{job.date_applied}</td>
                <td>
                  <a href={job.resume_link} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                </td>
                <td>{job.application_status}</td>
                <td>{job.interview_details}</td>
                <td>{job.contact_info}</td>
                <td>
                  <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="apply-link">
                    Apply
                  </a>
                  <button className="details-button">Details</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="empty-cell">No saved jobs found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <img src="MyJobs.png" alt="My Jobs" />

      <dive>
      <button className="next-button">Apply</button>
      </dive>
    </div>
  );
}

export default SavedJobs;
