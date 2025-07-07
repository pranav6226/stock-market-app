STDOUT:
import React, { useState } from 'react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor=username>Username:</label>
        <input 
          id=username 
          type=text 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label htmlFor=password>Password:</label>
        <input 
          id=password 
          type=password 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </div>
      <button type=submit>Login</button>
    </form>
  );
}

export default LoginForm;
