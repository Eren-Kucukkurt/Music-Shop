import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mockbank.css';

const MockBank = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Initializing payment verification...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate dynamic status updates and progress
    const steps = [
      'Initializing payment verification...',
      'Connecting to 308Bank secure servers...',
      'Verifying card details...',
      'Processing payment...',
      'Finalizing transaction...',
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setStatus(steps[currentStep]);
      setProgress((prev) => prev + 20);
      currentStep++;

      if (currentStep === steps.length) {
        clearInterval(interval);
        setTimeout(() => navigate('/invoice'), 1000); // Redirect after final step
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="mockbank-container">
      <h1>Payment Processing</h1>
      <p>{status}</p>
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progress}%` }}
          aria-label={`${progress}% complete`}
        ></div>
      </div>
      <div className="spinner"></div>
    </div>
  );
};

export default MockBank;
