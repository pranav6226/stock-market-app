import React from 'react';

const LandingPage = ({ onEnterApp }) => {
  return (
    <div className="landing-container">
      <div className="landing-hero">
        <h1>Stock Market Dashboard</h1>
        <p>
          The ultimate tool for investors to track, analyze, and compare stocks in real-time.
          Make smarter investment decisions with our comprehensive stock market analysis platform.
        </p>
        <button className="hero-cta" onClick={onEnterApp}>
          Enter Dashboard
        </button>
      </div>

      <div className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Analytics</h3>
            <p>View comprehensive stock performance data with interactive charts</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Technical Analysis</h3>
            <p>Get trading recommendations based on technical indicators</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Personalized Watchlists</h3>
            <p>Create and manage custom watchlists of your favorite stocks</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Stock Comparison</h3>
            <p>Compare multiple stocks side-by-side to find the best opportunities</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to start tracking stocks?</h2>
        <button className="hero-cta" onClick={onEnterApp}>
          Launch Dashboard
        </button>
      </div>

      <footer className="landing-footer">
        <p>
          Data provided by Yahoo Finance API. Built with React, deployed on Netlify & Render.
        </p>
        <p>
          <small>For demonstration purposes only. Not financial advice.</small>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage; 