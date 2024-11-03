import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import './JobDetails.css';

function JobDetails() {
    const user = useSelector((state) => state.user);
    const { jobId } = useParams();
    const job = useSelector((state) =>
        state.jobs.savedJobs.find((j) => j.external_job_id.toString() === jobId)
    );
    const dispatch = useDispatch();
    const history = useHistory();

    const [dateApplied, setDateApplied] = useState('');
    const [resumeLink, setResumeLink] = useState('');
    const [applicationStatus, setApplicationStatus] = useState('');
    const [interviewDetails, setInterviewDetails] = useState('');
    const [contactInfo, setContactInfo] = useState('');

    const handleClick = async (event) => {
        event.preventDefault();
        history.push('/savedjobs');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!job) {
            alert('Job not found. Please check your Saved Jobs list.');
            return;
        }

        try {
            const response = await axios.post('/api/applications', {
                job_id: job.job_id,
                external_job_id: job.external_job_id,
                user_id: user?.id,
                date_applied: dateApplied,
                resume_link: resumeLink,
                application_status: applicationStatus,
                interview_details: interviewDetails,
                contact_info: contactInfo,
            });

            if (response.data.success) {
                dispatch({ type: 'ADD_DETAILS', payload: response.data.data });
                alert('Application details saved successfully!');
                // Clear input fields after successful submission
                setDateApplied('');
                setResumeLink('');
                setApplicationStatus('');
                setInterviewDetails('');
                setContactInfo('');
            } else {
                alert(`Failed to save application details: ${response.data.message}`);
            }

        } catch (error) {
            console.error('Error saving application:', error);
            alert('An error occurred while saving the application. Please try again.');
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this job?');
        if (confirmDelete) {
            try {
                const response = await axios.delete(`/api/jobs/${job.job_id}`);
                if (response.data.success) {
                    dispatch({ type: 'DELETE_JOB', payload: job.id });
                    alert('Job deleted successfully!');
                    history.push('/savedjobs'); // Navigate back after deletion
                } else {
                    alert(`Failed to delete job: ${response.data.message}`);
                }
            } catch (error) {
                console.error('Error deleting job:', error);
                alert('An error occurred while deleting the job. Please try again.');
            }
        }
    };


    return (
        <>
            <form onSubmit={handleSubmit} className="application-form">

                <label>
                    Date Applied:
                    <input
                        type="date"
                        value={dateApplied}
                        onChange={(e) => setDateApplied(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Resume Link:
                    <input
                        type="url"
                        value={resumeLink}
                        onChange={(e) => setResumeLink(e.target.value)}
                        placeholder="http://example.com/my-resume"
                        required
                    />
                </label>

                <label>
                    Application Status:
                    <input
                        type="text"
                        value={applicationStatus}
                        onChange={(e) => setApplicationStatus(e.target.value)}
                        required
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
                        required
                    />
                </label>

                <button type="submit">Save Details</button>
            </form>
            <div>
                <button onClick={handleClick}> ⬅ Back to Saved Jobs</button>
                <button onClick={handleDelete}> 🅧 Delete Job</button>
            </div>

        </>
    );
}

export default JobDetails;
