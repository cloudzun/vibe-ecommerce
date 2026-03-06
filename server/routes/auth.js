const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { knex } = require('../db');
const { validateRegister, handleValidationErrors } = require("../middleware/validate");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

function makeTokens(userId, email) {
  const accessToken = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}

// POST /api/auth/register
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const existing = await knex('users').where({ email }).first();
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await knex('users').insert({ email, password_hash });

    res.status(201).json({ success: true, message: 'Account created' });
  } catch (e) {
    console.error('Register error:', e.message);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = makeTokens(user.id, user.email);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

    res.json({
      success: true,
      data: {
        accessToken,
        user: { id: user.id, email: user.email }
      }
    });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, error: 'No refresh token' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { id: payload.id, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ success: true, data: { accessToken } });
  } catch (e) {
    res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
