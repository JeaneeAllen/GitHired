import React from 'react';
import { useHistory } from 'react-router-dom';
import './LandingPage.css';

// CUSTOM COMPONENTS
import RegisterForm from '../RegisterForm/RegisterForm';

function LandingPage() {
  const history = useHistory();

  const onLogin = (event) => {
    history.push('/login');
  };

  return (
    <div className="container">
      <div className="grid">
        <div className="grid-col grid-col_8 landing-intro">
          <h1>Your job search, organized.</h1>
          <p className="landing-tagline">
            Search jobs, save the ones you like, and track every application in one place.
          </p>

          <ul className="landing-features">
            <li>
              <strong>Find jobs</strong>
              <span>Search thousands of listings by title, keyword, and location.</span>
            </li>
            <li>
              <strong>Save the good ones</strong>
              <span>Keep a short list of the roles you want to pursue.</span>
            </li>
            <li>
              <strong>Track your progress</strong>
              <span>Record when you applied, your resume, interviews, and contacts.</span>
            </li>
          </ul>
        </div>
        <div className="grid-col grid-col_4">
          <RegisterForm />

          <div className="landing-login">
            <h4>Already a Member?</h4>
            <button className="btn btn_sizeSm" onClick={onLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
