import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import './JobDetails.css';

function JobDetails({ job }) {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [dateApplied, setDateApplied] = useState('');
    const [resumeLink, setResumeLink] = useState('');
    const [applicationStatus, setApplicationStatus] = useState('');
    const [interviewDetails, setInterviewDetails] = useState('');
    const [contactInfo, setContactInfo] = useState('');

    const handleSubmit = async (event) => {
      event.preventDefault();
  
      try {
          const response = await axios.post('/api/applications', {
              job_id: job.id,
              user_id: user.id,
              date_applied: dateApplied,
              resume_link: resumeLink,
              application_status: applicationStatus,
              interview_details: interviewDetails,
              contact_info: contactInfo,
          });
  
          if (response.data.success) {
              dispatch({ type: 'SAVE_DETAILS', payload: response.data.data });
              alert('Application information saved successfully!');
          } else {
              alert(`Failed to save application: ${response.data.message}`);
          }
      } catch (error) {
          console.error('Error saving application:', error);
          alert('An error occurred while saving the application. Please try again.');
      }
  };
  

    return (
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
            <button type="submit">Remove Job</button>
        </form>
    );
}

export default JobDetails;
