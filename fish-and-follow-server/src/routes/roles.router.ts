import { Router } from 'express';
// import { db } from '../db/client';
// import { roles } from '../db/schema';
// import { eq } from 'drizzle-orm';

export const rolesRouter = Router();

// Temporary placeholder route
rolesRouter.get('/', (req, res) => {
  res.json({ message: 'Roles route works!' });
});
