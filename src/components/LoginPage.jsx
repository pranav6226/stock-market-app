import React, { useState } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      validateEmail(e.target.value);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      validatePassword(e.target.value);
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(email)) {
      setErrors((prev) => ({ ...prev, email: '' }));
    } else {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
    }
  };

  const validatePassword = (password) => {
    if (password.trim() === '') {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
    } else {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateEmail(email);
    validatePassword(password);

    if (!errors.email && !errors.password && email && password) {
      // Handle form submission (here we just log the values for visualization)
      console.log('Email:', email);
      console.log('Password:', password);
      // Reset form
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="login-page" style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => validateEmail(email)}
            required
          />
          {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => validatePassword(password)}
            required
          />
          {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
