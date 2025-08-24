import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }
    
    try {
      const payload = authService.verifyToken(token);
      req.user = payload;
      
      // Add userId to headers for backward compatibility
      req.headers['user-id'] = payload.userId;
      
      next();
    } catch (error) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication error' 
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const payload = authService.verifyToken(token);
        req.user = payload;
        req.headers['user-id'] = payload.userId;
      } catch (error) {
        // Token is invalid, but we continue without authentication
        console.log('Optional auth: Invalid token, continuing as guest');
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};
