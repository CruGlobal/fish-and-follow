import { NextFunction, Request, Response } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const isAuthenticated = req.isAuthenticated ? req.isAuthenticated() : !!req.user;
  
  if (!isAuthenticated) {
    return res.status(401).json({ 
      error: 'Authentication required',
      authenticated: false 
    });
  }
  
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        authenticated: false 
      });
    }

    const user = req.session as any;

    if (!user.userRole || !roles.includes(user.userRole)) {
      return res.status(403).json({ 
        error: 'Forbidden: insufficient role',
        requiredRoles: roles 
      });
    }

    next();
  };
};
