import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { statusClass } from '../../constants/applicationStatus';
import './SavedJobs.css';

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : 'N/A');

function SavedJobs() {
  const savedJobs = useSelector((state) => state.jobs.savedJobs);
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  // job_id of the row whose details are expanded, if any
  const [expandedId, setExpandedId] = useState(null);

  const removeJob = async (job) => {
    if (!window.confirm(`Remove "${job.title}" from My Jobs?`)) {
      return;
    }
    try {
      await axios.delete(`/api/jobs/${job.job_id}`);
      dispatch({ type: 'REMOVE_SAVED_JOB', payload: job.job_id });
      dispatch({ type: 'SHOW_TOAST', payload: { message: `Removed "${job.title}"` } });
    } catch (error) {
      console.error('Error removing job:', error);
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Failed to remove job. Please try again.', type: 'error' } });
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        dispatch({ type: 'LOAD_SAVED_JOBS', payload: response.data });
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [dispatch]);

  if (loading) {
    return <p className="container saved-jobs-page saved-jobs-message">Loading your jobs…</p>;
  }

  if (!savedJobs || savedJobs.length === 0) {
    return (
      <div className="container saved-jobs-page saved-jobs-message">
        <h2>My Saved Jobs</h2>
        <p>You haven't saved any jobs yet.</p>
        <Link to="/user" className="details-button">Find jobs</Link>
      </div>
    );
  }

  return (
    <div className="container saved-jobs-page">
      <h2>My Saved Jobs</h2>

      <div className="table-scroll">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Company</th>
              <th className="title-col">Job Title</th>
              <th>Status</th>
              <th>Date Applied</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {savedJobs.map((job) => {
              const expanded = expandedId === job.job_id;
              return (
                <React.Fragment key={job.job_id}>
                  <tr className={expanded ? 'expanded' : ''}>
                    <td>{job.company || 'N/A'}</td>
                    <td className="title-col">
                      <div className="job-title">{job.title || 'N/A'}</div>
                      <button
                        className="toggle-details"
                        onClick={() => setExpandedId(expanded ? null : job.job_id)}
                        aria-expanded={expanded}
                      >
                        {expanded ? 'Hide details ▴' : 'Show details ▾'}
                      </button>
                    </td>
                    <td>
                      <span className={`status-badge ${statusClass(job.application_status)}`}>
                        {job.application_status || 'Saved'}
                      </span>
                    </td>
                    <td>{formatDate(job.date_applied)}</td>
                    <td className="actions-col">
                      <button className="apply-button" onClick={() => window.open(job.redirect_url, '_blank', 'noopener')}>Apply</button>
                      <button className="details-button" onClick={() => history.push(`/JobDetails/${job.job_id}`)}>Edit Details</button>
                      <button className="remove-button" onClick={() => removeJob(job)}>Remove</button>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="details-row">
                      <td colSpan={5}>
                        <dl className="details-list">
                          <dt>Listed</dt>
                          <dd>{formatDate(job.created)}</dd>
                          <dt>Resume &amp; Cover Letter</dt>
                          <dd>{job.resume_link ? <a href={job.resume_link} target="_blank" rel="noreferrer">Open link</a> : 'N/A'}</dd>
                          <dt>Interview Details</dt>
                          <dd>{job.interview_details || 'N/A'}</dd>
                          <dt>Contact Info</dt>
                          <dd>{job.contact_info || 'N/A'}</dd>
                          <dt>Description</dt>
                          <dd>{job.description || 'N/A'}</dd>
                        </dl>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SavedJobs;
