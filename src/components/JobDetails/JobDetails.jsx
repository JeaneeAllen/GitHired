import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
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
                alert('Could not find that job.');
                history.push('/savedjobs');
            });
    }, [jobId, history]);

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
          alert('Application information saved successfully!');
          history.push('/savedjobs');
      } catch (error) {
          console.error('Error saving application:', error);
          alert('An error occurred while saving the application. Please try again.');
      }
  };

    const handleRemove = async () => {
        if (!window.confirm(`Remove "${job.title}" from My Jobs?`)) {
            return;
        }
        try {
            await axios.delete(`/api/jobs/${jobId}`);
            dispatch({ type: 'REMOVE_SAVED_JOB', payload: Number(jobId) });
            history.push('/savedjobs');
        } catch (error) {
            console.error('Error removing job:', error);
            alert('Failed to remove job. Please try again.');
        }
    };

    if (!job) {
        return <p>Loading...</p>;
    }

    return (
      <>
        <h2>{job.title}{job.company && ` at ${job.company}`}</h2>
        <form onSubmit={handleSubmit} className="application-form">

            <label>
                Date Applied:
                <input
                    type="date"
                    value={dateApplied}
                    onChange={(e) => setDateApplied(e.target.value)}
                />
            </label>

            <label>
                Resume Link:
                <input
                    type="url"
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                    placeholder="http://example.com/my-resume"
                />
            </label>

            <label>
                Application Status:
                <input
                    type="text"
                    value={applicationStatus}
                    onChange={(e) => setApplicationStatus(e.target.value)}
                />
            </label>

            <label>
                Interview Details:
                <textarea
                    value={interviewDetails}
                    onChange={(e) => setInterviewDetails(e.target.value)}
                    placeholder="Date/Time and Location"
                />
            </label>

            <label>
                Contact Info:
                <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                />
            </label>

            <button type="submit">Save Job Details</button>
        </form>
<div>
<button type="button" onClick={handleRemove}>Remove Job</button>
</div>

</>
    );
}

export default JobDetails;
