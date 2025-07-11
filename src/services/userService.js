// User service: Handles user registration, login, profile management, password reset, email verification, and role management

const users = [];

// Simulated user data structure
// {
//   id: string,
//   email: string,
//   passwordHash: string,
//   isEmailVerified: boolean,
//   roles: string[],
//   profile: {
//     name: string,
//     ...
//   }
// }

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your-secret-key';
const TOKEN_EXPIRATION = '1h';

function findUserByEmail(email) {
  return users.find(user => user.email === email);
}

function findUserById(id) {
  return users.find(user => user.id === id);
}

async function registerUser(email, password, name) {
  if(findUserByEmail(email)) {
    throw new Error('Email already registered');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    isEmailVerified: false,
    roles: ['user'],
    profile: { name }
  };
  users.push(user);
  // sendVerificationEmail(user);
  return user;
}

async function loginUser(email, password) {
  const user = findUserByEmail(email);
  if(!user) throw new Error('User not found');
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if(!isMatch) throw new Error('Invalid password');
  if(!user.isEmailVerified) throw new Error('Email not verified');
  const token = jwt.sign({ id: user.id, roles: user.roles }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
  return { user, token };
}

function verifyEmail(token) {
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const user = findUserById(payload.id);
    if(user) {
      user.isEmailVerified = true;
      return true;
    }
    return false;
  } catch(err) {
    return false;
  }
}

function getUserProfile(userId) {
  const user = findUserById(userId);
  if(!user) throw new Error('User not found');
  return user.profile;
}

function updateUserProfile(userId, profileData) {
  const user = findUserById(userId);
  if(!user) throw new Error('User not found');
  user.profile = { ...user.profile, ...profileData };
  return user.profile;
}

async function resetPassword(email, newPassword) {
  const user = findUserByEmail(email);
  if(!user) throw new Error('User not found');
  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  return true;
}

function checkRole(user, role) {
  return user.roles.includes(role);
}

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  getUserProfile,
  updateUserProfile,
  resetPassword,
  checkRole
};
