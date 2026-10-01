import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_STATUSES } from '../../constants/applicationStatus';
import { companyName } from '../../utils/companyName';
import './JobDetails.css';

function JobDetails() {
    const { jobId } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();

    const [job, setJob] = useState(null);
    const [dateApplied, setDateApplied] = useState('');
    const [resumeLink, setResumeLink] = useState('');
    const [applicationStatus, setApplicationStatus] = useState('');
    const [interviewDetails, setInterviewDetails] = useState('');
    const [contactInfo, setContactInfo] = useState('');

    // Load the job and pre-fill any details that were already saved
    useEffect(() => {
        axios.get(`/api/jobs/${jobId}`)
            .then((response) => {
                const savedJob = response.data;
                setJob(savedJob);
                setDateApplied(savedJob.date_applied ? savedJob.date_applied.slice(0, 10) : '');
                setResumeLink(savedJob.resume_link || '');
                setApplicationStatus(savedJob.application_status || '');
                setInterviewDetails(savedJob.interview_details || '');
                setContactInfo(savedJob.contact_info || '');
            })
            .catch((error) => {
                console.error('Error loading job:', error);
                dispatch({ type: 'SHOW_TOAST', payload: { message: 'Could not find that job.', type: 'error' } });
                history.push('/savedjobs');
            });
    }, [jobId, history, dispatch]);

    const handleSubmit = async (event) => {
      event.preventDefault();
  
      try {
          const response = await axios.post('/api/jobs/applications', {
              job_id: jobId,
              date_applied: dateApplied,
              resume_link: resumeLink,
              application_status: applicationStatus,
              interview_details: interviewDetails,
              contact_info: contactInfo,
          });
  
          dispatch({ type: 'SAVE_DETAILS', payload: response.data.data });
          dispatch({ type: 'SHOW_TOAST', payload: { message: 'Application details saved' } });
          history.push('/savedjobs');
      } catch (error) {
          console.error('Error saving application:', error);
          dispatch({ type: 'SHOW_TOAST', payload: { message: 'Failed to save details. Please try again.', type: 'error' } });
      }
  };

    const handleRemove = async () => {
        if (!window.confirm(`Remove "${job.title}" from My Jobs?`)) {
            return;
        }
        try {
            await axios.delete(`/api/jobs/${jobId}`);
            dispatch({ type: 'REMOVE_SAVED_JOB', payload: Number(jobId) });
            dispatch({ type: 'SHOW_TOAST', payload: { message: `Removed "${job.title}"` } });
            history.push('/savedjobs');
        } catch (error) {
            console.error('Error removing job:', error);
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Failed to remove job. Please try again.', type: 'error' } });
        }
    };

    if (!job) {
        return <p className="job-details-loading">Loading…</p>;
    }

    // Keep an older free-text status (e.g. "Pending") selectable alongside the standard ones
    const statusOptions = applicationStatus && !APPLICATION_STATUSES.includes(applicationStatus)
        ? [...APPLICATION_STATUSES, applicationStatus]
        : APPLICATION_STATUSES;

    return (
        <div className="job-details-page">
            <Link to="/savedjobs" className="back-link">← Back to My Jobs</Link>

            <div className="job-details-card">
                <div className="job-details-header">
                    <h2>{job.title}</h2>
                    {companyName(job.company) && <p className="job-details-company">{companyName(job.company)}</p>}
                    {job.redirect_url && (
                        <a href={job.redirect_url} target="_blank" rel="noreferrer">View listing on Adzuna</a>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="application-form">
                    <div className="form-row">
                        <label>
                            Application Status
                            <select
                                value={applicationStatus}
                                onChange={(e) => setApplicationStatus(e.target.value)}
                            >
                                <option value="">Not set</option>
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Date Applied
                            <input
                                type="date"
                                value={dateApplied}
                                onChange={(e) => setDateApplied(e.target.value)}
                            />
                        </label>
                    </div>

                    <label>
                        Resume &amp; Cover Letter Link
                        <input
                            type="url"
                            value={resumeLink}
                            onChange={(e) => setResumeLink(e.target.value)}
                            placeholder="https://example.com/my-resume"
                        />
                    </label>

                    <label>
                        Interview Details
                        <textarea
                            rows={3}
                            value={interviewDetails}
                            onChange={(e) => setInterviewDetails(e.target.value)}
                            placeholder="Date/Time and Location"
                        />
                    </label>

                    <label>
                        Contact Info
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            placeholder="Recruiter or hiring manager name, email, phone"
                        />
                    </label>

                    <div className="form-actions">
                        <button type="button" className="remove-job-button" onClick={handleRemove}>Remove Job</button>
                        <div className="form-actions-right">
                            <Link to="/savedjobs" className="cancel-link">Cancel</Link>
                            <button type="submit" className="save-details-button">Save Details</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JobDetails;
