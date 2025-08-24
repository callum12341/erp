import express from 'express';
import { authService, LoginSchema, RegisterSchema } from '../services/authService.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const userData = RegisterSchema.parse(req.body);
    
    const result = await authService.register(userData);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Registration failed' 
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const credentials = LoginSchema.parse(req.body);
    
    const result = await authService.login(credentials);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Login failed' 
    });
  }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }
    
    const payload = authService.verifyToken(token);
    const user = await authService.getUserById(payload.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('❌ Get user error:', error);
    res.status(401).json({ 
      success: false,
      error: error.message || 'Authentication failed' 
    });
  }
});

export { router as authRoutes };