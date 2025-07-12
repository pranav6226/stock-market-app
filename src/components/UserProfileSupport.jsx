import React, { useState, useEffect } from 'react';
import { validateUserProfile, sanitizeInput, uploadAvatar, savePreferences, loadPreferences } from '../utils/userProfileUtils';

/**
 * UserProfileSupport component provides supporting UI and logic for user profile management.
 * Includes avatar upload handler, settings, and preferences management.
 */
const UserProfileSupport = ({ initialProfile, onUpdate }) => {
  const [profile, setProfile] = useState({ ...initialProfile });
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [preferences, setPreferences] = useState(loadPreferences() || {});

  // Handle avatar file selection
  const handleAvatarChange = async (e) => {
    setUploadError(null);
    const file = e.target.files[0];
    if (!file) return;

    try {
      const avatarUrl = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatarUrl }));
      setAvatarFile(file);
    } catch (error) {
      setUploadError(error.message);
    }
  };

  // Handle profile input changes
  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: sanitizeInput(value) }));
  };

  // Save preferences
  const handleSavePreferences = async (newPrefs) => {
    setSaveError(null);
    try {
      await savePreferences(newPrefs);
      setPreferences(newPrefs);
    } catch (err) {
      setSaveError(err.message);
    }
  };

  // Validate and update profile
  const handleSaveProfile = () => {
    const { isValid, errors } = validateUserProfile(profile);
    if (!isValid) {
      setSaveError(Object.values(errors).join('; '));
      return;
    }
    setSaveError(null);
    onUpdate(profile);
  };

  useEffect(() => {
    setPreferences(loadPreferences() || {});
  }, []);

  return null; // This component contains supporting logic, UI to be integrated elsewhere
};

export default UserProfileSupport;
