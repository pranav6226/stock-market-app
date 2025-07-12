import React, { useState, useEffect } from 'react';
import UserProfileSupport from './UserProfileSupport';
import { validateUserProfile, sanitizeInput } from '../utils/userProfileUtils';

/**
 * UserProfile component
 * Provides user interface for profile management including avatar upload, settings, and preferences.
 */
function UserProfile() {
  // Initial user profile state
  const initialProfile = {
    username: '',
    email: '',
    avatarUrl: '',
    preferences: {},
  };

  const [profile, setProfile] = useState(initialProfile);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle input changes with sanitization
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sanitize input
    const sanitizedValue = sanitizeInput(value);
    setProfile((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  // Handle avatar upload handled by UserProfileSupport
  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  // Validate and save profile
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const { isValid, errors } = validateUserProfile(profile);
    if (!isValid) {
      setErrors(errors);
      setSaveError('Please fix validation errors before saving.');
      return;
    }

    setErrors({});

    // For this example, mock saving user profile to localStorage
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setSaveSuccess(true);
    } catch (err) {
      setSaveError('Failed to save profile: ' + err.message);
    }
  };

  // Load profile from localStorage on component mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (err) {
      // Ignore loading errors
      console.error('Failed to load user profile from localStorage', err);
    }
  }, []);

  return (
    <div className="user-profile">
      <h2>User Profile Management</h2>
      <UserProfileSupport initialProfile={profile} onUpdate={handleProfileUpdate} />
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="username">Username<span style={{color: 'red'}}>*</span>:</label>
          <input
            id="username"
            name="username"
            type="text"
            value={profile.username}
            onChange={handleChange}
            required
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="avatar">Avatar:</label>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="User Avatar"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          ) : (
            <p>No avatar uploaded</p>
          )}
          <p>Use the avatar upload above to change avatar.</p>
        </div>

        <button type="submit">Save Profile</button>
      </form>

      {saveError && <p className="error">{saveError}</p>}
      {saveSuccess && <p className="success">Profile saved successfully!</p>}
    </div>
  );
}

export default UserProfile;
