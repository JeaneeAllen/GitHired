import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import './HomePage.css';

// e.g. "$90k – $120k", or "$95k (est.)" when Adzuna estimated the salary
const formatSalary = (job) => {
  const toK = (amount) => `$${Math.round(amount / 1000)}k`;
  const { salary_min: min, salary_max: max } = job;
  if (!min && !max) {
    return null;
  }
  const range = min && max && Math.round(min / 1000) !== Math.round(max / 1000)
    ? `${toK(min)} – ${toK(max)}`
    : toK(min || max);
  return job.salary_is_predicted === '1' ? `${range} (est.)` : range;
};

function HomePage() {
  const user = useSelector((store) => store.user);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  // Adzuna ids of jobs the user has already saved, so their cards show "Saved"
  const [savedIds, setSavedIds] = useState(new Set());
  // The search the current results came from, so "Load more" pages through the same search
  // The default search matches any of the job titles' words; typed searches match all words
  const [activeSearch, setActiveSearch] = useState({ keywords: 'Software Engineer, Business Analyst, Data Scientist, Data Analyst, Data Engineer', location: 'Minnesota', matchAny: true });
  const dispatch = useDispatch();

  const showError = (message) => dispatch({ type: 'SHOW_TOAST', payload: { message, type: 'error' } });

  const fetchJobs = async (searchKeywords, searchLocation, currentPage, matchAny = false) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/jobs/search', {
        params: {
          keywords: searchKeywords,
          location: searchLocation,
          page: currentPage,
          matchAny
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showError('Failed to load jobs. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load the default search and the user's saved jobs once when the page opens
  useEffect(() => {
    fetchJobs(activeSearch.keywords, activeSearch.location, 1, activeSearch.matchAny).then(setJobs);
    axios.get('/api/jobs')
      .then((response) => {
        setSavedIds(new Set(response.data.map((job) => job.external_job_id).filter(Boolean)));
      })
      .catch((error) => console.error('Error fetching saved jobs:', error));
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    setJobs([]);
    const newJobs = await fetchJobs(keywords, location, 1);
    setActiveSearch({ keywords, location, matchAny: false });
    setJobs(newJobs);
    setPage(1);
  };

  const loadMoreJobs = async () => {
    const newJobs = await fetchJobs(activeSearch.keywords, activeSearch.location, page + 1, activeSearch.matchAny);
    setJobs((prevJobs) => [...prevJobs, ...newJobs]);
    setPage(page + 1);
  };

  const saveJob = async (job) => {
    try {
      const jobResult = await axios.post('/api/jobs', {
        external_job_id: job.id,
        title: job.title,
        company: job.company?.display_name,
        created: job.created,
        description: job.description,
        redirect_url: job.redirect_url
      });
      dispatch({ type: 'SAVE_JOB', payload: { ...jobResult.data, job_id: jobResult.data.id } });
      setSavedIds((prevIds) => new Set(prevIds).add(job.id));
      dispatch({ type: 'SHOW_TOAST', payload: { message: `Saved "${job.title}" to My Jobs` } });
    } catch (error) {
      if (error.response?.status === 409) {
        // Already saved (e.g. in another tab) -- just mark it
        setSavedIds((prevIds) => new Set(prevIds).add(job.id));
        return;
      }
      console.error('Error saving job:', error);
      showError('Failed to save job. Please try again.');
    }
  };

  // Search results aren't stored in the database, so removing just hides the listing
  const removeJob = (job) => {
    setJobs((prevJobs) => prevJobs.filter((j) => j.id !== job.id));
  };

  return (
    <div className="user-page-container">
      <div className="header">
        <h2>Welcome, {user.username}!</h2>
        <p>Embark on Your Next Adventure! Discover Exciting New Career Opportunities Below!</p>
      </div>

      <div className="search-container">
        <h1>Find Jobs</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Job Title or Keywords"
            id="job-keywords"
            name="job-keywords"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            id="job-location"
            name="job-location"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>

      <div className="job-listings-container">
        <h1>Job Listings</h1>
        <div className="job-grid">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-info">
                  <h2>{job.title}</h2>
                  <p className="job-company">{job.company?.display_name || 'Company not listed'}</p>
                  <p className="job-meta">
                    {job.location?.display_name && <span>📍 {job.location.display_name}</span>}
                    {formatSalary(job) && <span>💰 {formatSalary(job)}</span>}
                  </p>
                  <p className="job-description">{job.description}</p>
                  {job.redirect_url && (
                    <a href={job.redirect_url} target="_blank" rel="noreferrer" className="view-listing-link">
                      View listing on Adzuna
                    </a>
                  )}
                </div>
                <div className="job-actions">
                  {savedIds.has(job.id) ? (
                    <button className="apply-button saved" disabled>Saved ✓</button>
                  ) : (
                    <button onClick={() => saveJob(job)} className="apply-button">Save</button>
                  )}
                  <button onClick={() => removeJob(job)} className="decline-button">Remove</button>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="no-results">No jobs found. Please try a different search.</p>
          )}
        </div>
        {loading && <p className="loading-message">Searching for jobs…</p>}
        {jobs.length > 0 && !loading && (
          <button onClick={loadMoreJobs} className="next-button">Load more</button>
        )}
      </div>
    </div>
  );
}

export default HomePage;
