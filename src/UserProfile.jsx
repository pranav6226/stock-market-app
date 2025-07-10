import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/user/profile')
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        setError(error.response?.data?.detail || 'Error fetching profile');
      });
  }, []);

  const handleChange = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.put('/api/user/profile', user)
      .then(() => {
        alert('Profile updated successfully');
        navigate('/dashboard');
      })
      .catch(error => {
        setError(error.response?.data?.detail || 'Error updating profile');
      });
  };

  if (error) return <div>{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input name="username" type="text" value={user.username || ''} onChange={handleChange} />
        </label><br />
        <label>
          Email:
          <input name="email" type="email" value={user.email || ''} onChange={handleChange} />
        </label><br />
        <label>
          Bio:
          <textarea name="bio" value={user.bio || ''} onChange={handleChange} />
        </label><br />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
