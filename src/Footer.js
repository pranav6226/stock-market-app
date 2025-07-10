import React from 'react';

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <span className="text-muted">© 2025 Stock Market App. All rights reserved.</span>
      </div>
      <style jsx>{`
        .footer {
          background-color: #f8f9fa;
          padding: 20px 0;
          position: fixed;
          width: 100%;
          bottom: 0;
          text-align: center;
          border-top: 1px solid #e7e7e7;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
