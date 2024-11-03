import express from 'express';
import path from 'path';
import auth from '../middleware/auth.js';
const router = express.Router();

// Serve admin login page
router.get('/login', (_, res) => {
  res.sendFile(path.join(__dirname, './admin/login.html'));
});

// Serve admin dashboard (protected route)
router.get('/dashboard', auth, (_, res) => {
  res.sendFile(path.join(__dirname, './admin/dashboard.html'));
});

export default router;