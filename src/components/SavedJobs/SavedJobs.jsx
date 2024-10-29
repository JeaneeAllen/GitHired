import React from 'react';

function SavedJobs() {
  const jobData = [];


  return (
    
      <div className="container">
        <p>My Saved Jobs</p>
  
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {jobData.length > 0 ? (
              jobData.map((job, index) => (
                <tr key={index}>
                  <td>{job.companyName}</td>
                  <td>{job.jobTitle}</td>
                  <td>{job.listingDate}</td>
                  <td>{job.jobDescription}</td>
                  <td>{job.dateApplied}</td>
                  <td>
                    <a href={job.resumeLink} target="_blank" rel="noopener noreferrer">
                      Link
                    </a>
                  </td>
                  <td>{job.applicationStatus}</td>
                  <td>{job.interviewDetails}</td>
                  <td>{job.contactInfo}</td>
                  <td> <a href={job.redirect_url}>Apply</a></td>
                  <td><button className="details-button">Details</button></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">No job applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default SavedJobs;